from django.db import models
from django.contrib.auth.models import User
from django.db.models import F
from django.utils import timezone


class Post(models.Model):
    """
    Represents a post in the community feed.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    like_count = models.IntegerField(default=0, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'like_count']),
        ]
    
    def __str__(self):
        return f"Post by {self.author.username}: {self.content[:50]}"


class Comment(models.Model):
    """
    Represents a comment on a post or a reply to another comment.
    Uses a parent-child relationship for nested threading.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    like_count = models.IntegerField(default=0)
    
    # Tree path helps with efficient querying of nested structures
    # Format: "1/3/5/" means comment 5 is a child of 3, which is a child of 1
    tree_path = models.CharField(max_length=500, blank=True, db_index=True)
    depth = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'parent']),
            models.Index(fields=['post', 'tree_path']),
            models.Index(fields=['-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """
        Override save to automatically calculate tree_path and depth.
        This enables efficient querying of comment trees without recursive queries.
        """
        if self.parent:
            self.depth = self.parent.depth + 1
            if not self.pk:
                # For new comments, we'll update tree_path after save
                super().save(*args, **kwargs)
                self.tree_path = f"{self.parent.tree_path}{self.pk}/"
                super().save(update_fields=['tree_path'])
            else:
                self.tree_path = f"{self.parent.tree_path}{self.pk}/"
                super().save(*args, **kwargs)
        else:
            self.depth = 0
            if not self.pk:
                super().save(*args, **kwargs)
                self.tree_path = f"{self.pk}/"
                super().save(update_fields=['tree_path'])
            else:
                self.tree_path = f"{self.pk}/"
                super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.id}"


class Like(models.Model):
    """
    Represents a like on either a post or a comment.
    Uses unique constraints to prevent duplicate likes (race condition handling).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        # These unique constraints prevent duplicate likes even under race conditions
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=models.Q(post__isnull=False),
                name='unique_post_like_per_user'
            ),
            models.UniqueConstraint(
                fields=['user', 'comment'],
                condition=models.Q(comment__isnull=False),
                name='unique_comment_like_per_user'
            ),
            models.CheckConstraint(
                check=models.Q(post__isnull=False) | models.Q(comment__isnull=False),
                name='like_has_post_or_comment'
            ),
            models.CheckConstraint(
                check=~(models.Q(post__isnull=False) & models.Q(comment__isnull=False)),
                name='like_not_both_post_and_comment'
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['user', 'comment']),
            models.Index(fields=['-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """
        Override save to update like counts and handle karma calculation.
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update the like count on the related object
            if self.post:
                Post.objects.filter(pk=self.post.pk).update(like_count=F('like_count') + 1)
            elif self.comment:
                Comment.objects.filter(pk=self.comment.pk).update(like_count=F('like_count') + 1)
    
    def delete(self, *args, **kwargs):
        """
        Override delete to update like counts when a like is removed.
        """
        if self.post:
            Post.objects.filter(pk=self.post.pk).update(like_count=F('like_count') - 1)
        elif self.comment:
            Comment.objects.filter(pk=self.comment.pk).update(like_count=F('like_count') - 1)
        
        super().delete(*args, **kwargs)
    
    def __str__(self):
        if self.post:
            return f"{self.user.username} liked post {self.post.id}"
        else:
            return f"{self.user.username} liked comment {self.comment.id}"
