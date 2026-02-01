from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Post, Comment, Like
from django.db.models import Q, Sum, Case, When, IntegerField, F


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
        """
        # Create a like on post1 (5 karma for user1) - recent
        Like.objects.create(user=self.liker, post=self.post1)
        
        # Create a like on comment1 (1 karma for user1) - recent
        Like.objects.create(user=self.liker, comment=self.comment1)
        
        # Create an old like (should not count)
        old_like = Like.objects.create(user=self.user3, post=self.post2)
        # Manually set the created_at to 25 hours ago
        old_like.created_at = timezone.now() - timedelta(hours=25)
        old_like.save(update_fields=['created_at'])
        
        # Calculate leaderboard
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        leaderboard_data = User.objects.filter(
            Q(posts__likes__created_at__gte=twenty_four_hours_ago) |
            Q(comments__likes__created_at__gte=twenty_four_hours_ago)
        ).annotate(
            post_karma=Sum(
                Case(
                    When(
                        posts__likes__created_at__gte=twenty_four_hours_ago,
                        then=5
                    ),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            comment_karma=Sum(
                Case(
                    When(
                        comments__likes__created_at__gte=twenty_four_hours_ago,
                        then=1
                    ),
                    default=0,
                    output_field=IntegerField()
                )
            )
        ).annotate(
            karma=F('post_karma') + F('comment_karma')
        ).filter(
            karma__gt=0
        ).order_by('-karma')
        
        # Convert to list for easier testing
        leaderboard = list(leaderboard_data)
        
        # user1 should be first with 6 karma (5 from post + 1 from comment)
        self.assertEqual(len(leaderboard), 1)
        self.assertEqual(leaderboard[0].username, 'user1')
        self.assertEqual(leaderboard[0].karma, 6)
        self.assertEqual(leaderboard[0].post_karma, 5)
        self.assertEqual(leaderboard[0].comment_karma, 1)
        
        # user2 should not be in leaderboard (old like doesn't count)
        usernames = [u.username for u in leaderboard]
        self.assertNotIn('user2', usernames)
    
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
