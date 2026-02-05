from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum, Case, When, IntegerField, F, Prefetch
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import timedelta
from .models import Post, Comment, Like
from .serializers import (
    PostSerializer, PostCreateSerializer, CommentSerializer, 
    CommentCreateSerializer, LikeSerializer, UserSerializer,
    LeaderboardSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing posts.
    """
    queryset = Post.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer
    
    def get_queryset(self):
        """
        Optimize queryset with select_related and prefetch_related to avoid N+1 queries.
        """
        return Post.objects.select_related('author').prefetch_related(
            Prefetch(
                'comments',
                queryset=Comment.objects.select_related('author').filter(parent__isnull=True)
            )
        ).order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        """
        Like a post. Handles race conditions with database constraints.
        """
        post = self.get_object()
        username = request.data.get('username', 'Guest')
        
        try:
            # Get or create user
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@example.com'}
            )
            
            # Use atomic transaction to ensure consistency
            with transaction.atomic():
                like, created = Like.objects.get_or_create(
                    user=user,
                    post=post
                )
                
                if not created:
                    return Response(
                        {'detail': 'You have already liked this post.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Refresh post to get updated like_count
                post.refresh_from_db()
                
                return Response(
                    {
                        'detail': 'Post liked successfully.',
                        'like_count': post.like_count
                    },
                    status=status.HTTP_201_CREATED
                )
        
        except IntegrityError:
            # This handles the race condition where two requests try to create the same like
            return Response(
                {'detail': 'You have already liked this post.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def unlike(self, request, pk=None):
        """
        Unlike a post.
        """
        post = self.get_object()
        username = request.data.get('username', 'Guest')
        
        try:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@example.com'}
            )
            
            with transaction.atomic():
                like = Like.objects.get(user=user, post=post)
                like.delete()
                
                # Refresh post to get updated like_count
                post.refresh_from_db()
                
                return Response(
                    {
                        'detail': 'Post unliked successfully.',
                        'like_count': post.like_count
                    },
                    status=status.HTTP_200_OK
                )
        
        except Like.DoesNotExist:
            return Response(
                {'detail': 'You have not liked this post.'},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments.
    """
    queryset = Comment.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        """
        Optimize queryset with select_related to avoid N+1 queries.
        """
        queryset = Comment.objects.select_related('author', 'post', 'parent')
        
        # Filter by post if provided
        post_id = self.request.query_params.get('post_id')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        """
        Like a comment. Handles race conditions with database constraints.
        """
        comment = self.get_object()
        username = request.data.get('username', 'Guest')
        
        try:
            # Get or create user
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@example.com'}
            )
            
            with transaction.atomic():
                like, created = Like.objects.get_or_create(
                    user=user,
                    comment=comment
                )
                
                if not created:
                    return Response(
                        {'detail': 'You have already liked this comment.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Refresh comment to get updated like_count
                comment.refresh_from_db()
                
                return Response(
                    {
                        'detail': 'Comment liked successfully.',
                        'like_count': comment.like_count
                    },
                    status=status.HTTP_201_CREATED
                )
        
        except IntegrityError:
            return Response(
                {'detail': 'You have already liked this comment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def unlike(self, request, pk=None):
        """
        Unlike a comment.
        """
        comment = self.get_object()
        username = request.data.get('username', 'Guest')
        
        try:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@example.com'}
            )
            
            with transaction.atomic():
                like = Like.objects.get(user=user, comment=comment)
                like.delete()
                
                # Refresh comment to get updated like_count
                comment.refresh_from_db()
                
                return Response(
                    {
                        'detail': 'Comment unliked successfully.',
                        'like_count': comment.like_count
                    },
                    status=status.HTTP_200_OK
                )
        
        except Like.DoesNotExist:
            return Response(
                {'detail': 'You have not liked this comment.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class LeaderboardViewSet(viewsets.ViewSet):
    """
    ViewSet for the leaderboard.
    Calculates top users based on karma earned in the last 24 hours.
    """
    
    @action(detail=False, methods=['get'])
    def top_users(self, request):
        """
        Get top 5 users by karma earned in the last 24 hours.
        
        Karma calculation:
        - 1 Like on a Post = 5 Karma
        - 1 Like on a Comment = 1 Karma
        
        This is calculated dynamically from the Like table based on likes received
        in the last 24 hours, not stored in a field.
        """
        # Calculate time 24 hours ago
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        # This is the critical query for the leaderboard
        # It counts likes received on posts and comments in the last 24 hours
        leaderboard_data = User.objects.filter(
            Q(posts__likes__created_at__gte=twenty_four_hours_ago) |
            Q(comments__likes__created_at__gte=twenty_four_hours_ago)
        ).annotate(
            # Count likes received on user's posts in last 24h (each worth 5 karma)
            post_likes=Count(
                'posts__likes',
                filter=Q(posts__likes__created_at__gte=twenty_four_hours_ago),
                distinct=True
            ),
            # Count likes received on user's comments in last 24h (each worth 1 karma)
            comment_likes=Count(
                'comments__likes',
                filter=Q(comments__likes__created_at__gte=twenty_four_hours_ago),
                distinct=True
            ),
            # Count total posts created (for display)
            post_count=Count('posts', distinct=True),
            # Count total comments created (for display)
            comment_count=Count('comments', distinct=True)
        ).annotate(
            # Calculate total karma: (post_likes * 5) + (comment_likes * 1)
            karma=(F('post_likes') * 5) + (F('comment_likes') * 1)
        ).filter(
            karma__gt=0
        ).order_by('-karma')[:5]
        
        # Format the data for the serializer
        formatted_data = [
            {
                'user_id': user.id,
                'username': user.username,
                'karma': user.karma or 0,
                'post_count': user.post_count or 0,
                'comment_count': user.comment_count or 0,
            }
            for user in leaderboard_data
        ]
        
        serializer = LeaderboardSerializer(formatted_data, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request):
        """Get the current user's information."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
