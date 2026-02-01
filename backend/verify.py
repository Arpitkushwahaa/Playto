"""
Simple verification script to check if all imports work correctly.
Run with: python verify.py
"""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community_feed.settings')

import django
django.setup()

print("✓ Django setup successful")

# Test imports
try:
    from feed.models import Post, Comment, Like
    print("✓ Models imported successfully")
except Exception as e:
    print(f"✗ Model import failed: {e}")
    sys.exit(1)

try:
    from feed.serializers import PostSerializer, CommentSerializer, LeaderboardSerializer
    print("✓ Serializers imported successfully")
except Exception as e:
    print(f"✗ Serializer import failed: {e}")
    sys.exit(1)

try:
    from feed.views import PostViewSet, CommentViewSet, LeaderboardViewSet
    print("✓ Views imported successfully")
except Exception as e:
    print(f"✗ View import failed: {e}")
    sys.exit(1)

print("\n✅ All verification checks passed!")
print("The backend code is ready to run.")
