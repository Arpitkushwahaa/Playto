from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like
from django.db.models import Prefetch


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CommentSerializer(serializers.ModelSerializer):
    """
    Recursive serializer for nested comments.
    Handles the comment tree structure efficiently.
    """
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'post', 'parent', 'content', 'created_at', 
                  'updated_at', 'like_count', 'depth', 'replies']
        read_only_fields = ['id', 'created_at', 'updated_at', 'like_count', 'depth']
    
    def get_replies(self, obj):
        """
        Get nested replies efficiently using prefetched data.
        This avoids N+1 queries by using the prefetched 'replies' relation.
        """
        # Check if replies were prefetched
        if hasattr(obj, '_prefetched_objects_cache') and 'replies' in obj._prefetched_objects_cache:
            replies = obj.replies.all()
        else:
            # Fallback to direct query (will cause N+1 if not careful)
            replies = obj.replies.select_related('author').prefetch_related(
                Prefetch('replies', queryset=Comment.objects.select_related('author').all())
            )
        
        if replies:
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments."""
    
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']
    
    def create(self, validated_data):
        # Generate a random username for demo purposes
        import random
        username = f"User{random.randint(1, 9999)}"
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        validated_data['author'] = user
        return super().create(validated_data)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model with nested comments."""
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'updated_at', 
                  'like_count', 'comments', 'comment_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'like_count']
    
    def get_comments(self, obj):
        """
        Get all top-level comments with their nested replies.
        Uses efficient prefetching to avoid N+1 queries.
        """
        # Get only top-level comments (no parent)
        top_level_comments = obj.comments.filter(parent__isnull=True).select_related('author').prefetch_related(
            Prefetch('replies', queryset=Comment.objects.select_related('author').prefetch_related(
                Prefetch('replies', queryset=Comment.objects.select_related('author').prefetch_related(
                    'replies__author'  # Pre-fetch up to 3 levels deep
                ))
            ))
        )
        
        return CommentSerializer(top_level_comments, many=True, context=self.context).data
    
    def get_comment_count(self, obj):
        """Get total count of all comments on this post."""
        return obj.comments.count()


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts."""
    
    class Meta:
        model = Post
        fields = ['content']
    
    def create(self, validated_data):
        # Generate a random username for demo purposes
        import random
        username = f"User{random.randint(1, 9999)}"
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        validated_data['author'] = user
        return super().create(validated_data)


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for Like model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def validate(self, data):
        """Ensure that a like is for either a post or a comment, not both."""
        if data.get('post') and data.get('comment'):
            raise serializers.ValidationError("A like can be for either a post or a comment, not both.")
        if not data.get('post') and not data.get('comment'):
            raise serializers.ValidationError("A like must be for either a post or a comment.")
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data."""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    karma = serializers.IntegerField()
    post_karma = serializers.IntegerField()
    comment_karma = serializers.IntegerField()
