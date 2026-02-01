from django.contrib import admin
from .models import Post, Comment, Like

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content', 'created_at', 'like_count']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'parent', 'content', 'created_at', 'like_count']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'comment', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
