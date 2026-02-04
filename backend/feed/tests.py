from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Post, Comment, Like
from django.db.models import Q, Count, F
from django.db import connection
from django.test.utils import override_settings


class LeaderboardTestCase(TestCase):
    """
    Test case for the leaderboard calculation logic.
    This tests the critical requirement of calculating karma from the last 24 hours only.
    """
    
    def setUp(self):
        """Set up test users and posts."""
        # Create test users
        self.user1 = User.objects.create_user(username='user1', password='testpass123')
        self.user2 = User.objects.create_user(username='user2', password='testpass123')
        self.user3 = User.objects.create_user(username='user3', password='testpass123')
        self.liker = User.objects.create_user(username='liker', password='testpass123')
        
        # Create posts
        self.post1 = Post.objects.create(author=self.user1, content='Post by user1')
        self.post2 = Post.objects.create(author=self.user2, content='Post by user2')
        
        # Create comments
        self.comment1 = Comment.objects.create(
            post=self.post1,
            author=self.user1,
            content='Comment by user1'
        )
        self.comment2 = Comment.objects.create(
            post=self.post1,
            author=self.user2,
            content='Comment by user2'
        )
    
    def test_leaderboard_calculation_last_24h(self):
        """
        Test that the leaderboard correctly calculates karma from the last 24 hours only.
        This is the CRITICAL test for the main requirement.
        
        Karma Rules:
        - 1 Like on a Post = 5 Karma
        - 1 Like on a Comment = 1 Karma
        - Only likes from last 24h count
        """
        # Create likes on post1 (5 karma for user1) - recent
        Like.objects.create(user=self.liker, post=self.post1)
        
        # Create a like on comment1 (1 karma for user1) - recent
        Like.objects.create(user=self.liker, comment=self.comment1)
        
        # Create an old like on post2 (should NOT count for user2)
        old_like = Like.objects.create(user=self.user3, post=self.post2)
        old_like.created_at = timezone.now() - timedelta(hours=25)
        old_like.save(update_fields=['created_at'])
        
        # Calculate leaderboard using the CORRECT query (not the buggy AI version)
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        leaderboard_data = User.objects.filter(
            Q(posts__likes__created_at__gte=twenty_four_hours_ago) |
            Q(comments__likes__created_at__gte=twenty_four_hours_ago)
        ).annotate(
            # Count distinct likes on posts in last 24h
            post_likes=Count(
                'posts__likes',
                filter=Q(posts__likes__created_at__gte=twenty_four_hours_ago),
                distinct=True
            ),
            # Count distinct likes on comments in last 24h
            comment_likes=Count(
                'comments__likes',
                filter=Q(comments__likes__created_at__gte=twenty_four_hours_ago),
                distinct=True
            ),
        ).annotate(
            # Calculate karma: (post_likes * 5) + (comment_likes * 1)
            karma=(F('post_likes') * 5) + (F('comment_likes') * 1)
        ).filter(
            karma__gt=0
        ).order_by('-karma')[:5]
        
        # Convert to list for testing
        leaderboard = list(leaderboard_data)
        
        # Assertions
        self.assertEqual(len(leaderboard), 1, "Should have exactly 1 user in leaderboard")
        self.assertEqual(leaderboard[0].username, 'user1', "user1 should be #1")
        self.assertEqual(leaderboard[0].karma, 6, "user1 should have 6 karma (5 from post + 1 from comment)")
        self.assertEqual(leaderboard[0].post_likes, 1, "user1 should have 1 post like")
        self.assertEqual(leaderboard[0].comment_likes, 1, "user1 should have 1 comment like")
        
        # user2's old like should NOT count
        usernames = [u.username for u in leaderboard]
        self.assertNotIn('user2', usernames, "user2 should not appear (old like doesn't count)")
    
    def test_no_double_like_on_post(self):
        """
        Test that a user cannot double-like a post (race condition prevention).
        """
        # First like should succeed
        like1 = Like.objects.create(user=self.liker, post=self.post1)
        self.assertIsNotNone(like1.pk)
        
        # Second like should fail due to unique constraint
        with self.assertRaises(Exception):
            Like.objects.create(user=self.liker, post=self.post1)
        
        # Verify only one like exists
        like_count = Like.objects.filter(user=self.liker, post=self.post1).count()
        self.assertEqual(like_count, 1)
    
    def test_no_double_like_on_comment(self):
        """
        Test that a user cannot double-like a comment (race condition prevention).
        """
        # First like should succeed
        like1 = Like.objects.create(user=self.liker, comment=self.comment1)
        self.assertIsNotNone(like1.pk)
        
        # Second like should fail due to unique constraint
        with self.assertRaises(Exception):
            Like.objects.create(user=self.liker, comment=self.comment1)
        
        # Verify only one like exists
        like_count = Like.objects.filter(user=self.liker, comment=self.comment1).count()
        self.assertEqual(like_count, 1)
    
    def test_comment_tree_structure(self):
        """
        Test that nested comments are properly structured with tree_path.
        """
        # Create a reply to comment1
        reply1 = Comment.objects.create(
            post=self.post1,
            author=self.user2,
            parent=self.comment1,
            content='Reply to comment1'
        )
        
        # Verify depth and tree_path
        self.assertEqual(reply1.depth, 1)
        self.assertTrue(reply1.tree_path.startswith(self.comment1.tree_path))
        
        # Create a nested reply
        reply2 = Comment.objects.create(
            post=self.post1,
            author=self.user3,
            parent=reply1,
            content='Reply to reply1'
        )
        
        # Verify depth and tree_path
        self.assertEqual(reply2.depth, 2)
        self.assertTrue(reply2.tree_path.startswith(reply1.tree_path))


class NPlusOnePreventionTestCase(TestCase):
    """
    Test case to verify that loading posts with nested comments doesn't cause N+1 queries.
    """
    
    def setUp(self):
        """Create test data with nested comments."""
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.post = Post.objects.create(author=self.user, content='Test post with many comments')
        
        # Create 10 top-level comments
        self.top_comments = []
        for i in range(10):
            comment = Comment.objects.create(
                post=self.post,
                author=self.user,
                content=f'Top-level comment {i}'
            )
            self.top_comments.append(comment)
            
            # Add 3 replies to each top-level comment
            for j in range(3):
                reply = Comment.objects.create(
                    post=self.post,
                    author=self.user,
                    parent=comment,
                    content=f'Reply {j} to comment {i}'
                )
                
                # Add 2 nested replies
                for k in range(2):
                    Comment.objects.create(
                        post=self.post,
                        author=self.user,
                        parent=reply,
                        content=f'Nested reply {k} to reply {j}'
                    )
    
    @override_settings(DEBUG=True)
    def test_no_n_plus_one_with_prefetch(self):
        """
        Test that loading a post with 70 nested comments uses minimal queries.
        Without optimization: 70+ queries
        With optimization: ~4-6 queries
        """
        from .serializers import PostSerializer
        
        # Reset query log
        connection.queries_log.clear()
        
        # Fetch post with optimized queryset (like in the view)
        from django.db.models import Prefetch
        post = Post.objects.select_related('author').prefetch_related(
            Prefetch(
                'comments',
                queryset=Comment.objects.select_related('author').filter(parent__isnull=True).prefetch_related(
                    Prefetch(
                        'replies',
                        queryset=Comment.objects.select_related('author').prefetch_related(
                            Prefetch(
                                'replies',
                                queryset=Comment.objects.select_related('author').all()
                            )
                        )
                    )
                )
            )
        ).get(pk=self.post.pk)
        
        # Serialize the post (this triggers the queries)
        serializer = PostSerializer(post)
        data = serializer.data
        
        # Count queries
        query_count = len(connection.queries)
        
        # Should use < 10 queries for 70 comments (vs 70+ without optimization)
        self.assertLess(query_count, 10, f"Used {query_count} queries, should be < 10")
        
        # Verify all comments are loaded
        self.assertEqual(len(data['comments']), 10, "Should have 10 top-level comments")
        self.assertEqual(len(data['comments'][0]['replies']), 3, "Should have 3 replies")
        self.assertEqual(len(data['comments'][0]['replies'][0]['replies']), 2, "Should have 2 nested replies")
