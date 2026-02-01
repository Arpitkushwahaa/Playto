"""
Seed script to populate the database with sample data for testing.
Run with: python manage.py shell < seed_data.py
"""

from django.contrib.auth.models import User
from feed.models import Post, Comment, Like
from django.utils import timezone
from datetime import timedelta
import random

print("Starting database seeding...")

# Create users
print("\n📝 Creating users...")
users = []
usernames = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry']

for username in usernames:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f'{username}@example.com',
            'first_name': username.capitalize()
        }
    )
    if created:
        user.set_password('password123')
        user.save()
        print(f"  ✓ Created user: {username}")
    else:
        print(f"  • User already exists: {username}")
    users.append(user)

# Create posts
print("\n📮 Creating posts...")
post_contents = [
    "Just finished reading an amazing book on software architecture. The patterns discussed are mind-blowing!",
    "What's everyone's favorite programming language and why? I'm curious to hear different perspectives.",
    "Hot take: Code comments are overrated if your code is self-documenting. Thoughts?",
    "Deployed my first Kubernetes cluster today. The learning curve is steep but worth it!",
    "Anyone else excited about the new features in the latest framework release?",
    "Debugging a production issue at 2 AM hits different. Coffee is life. ☕",
    "Just discovered this amazing library that makes async programming so much easier!",
    "Remember: Perfect is the enemy of good. Ship that feature!",
]

posts = []
for i, content in enumerate(post_contents):
    post = Post.objects.create(
        author=users[i % len(users)],
        content=content
    )
    # Set created_at to various times in the last 48 hours
    hours_ago = random.randint(1, 48)
    post.created_at = timezone.now() - timedelta(hours=hours_ago)
    post.save(update_fields=['created_at'])
    posts.append(post)
    print(f"  ✓ Created post by {post.author.username}")

# Create comments
print("\n💬 Creating comments...")
comment_templates = [
    "Great point! I totally agree with this.",
    "Interesting perspective, though I see it a bit differently...",
    "This is exactly what I needed to hear today!",
    "Could you elaborate more on this?",
    "I've been saying this for years!",
    "Thanks for sharing, very insightful.",
    "Hmm, I'm not sure I agree, but I see where you're coming from.",
    "This reminds me of a similar situation I encountered...",
]

comments = []
for post in posts:
    # Create 3-7 top-level comments per post
    num_comments = random.randint(3, 7)
    for _ in range(num_comments):
        comment = Comment.objects.create(
            post=post,
            author=random.choice(users),
            content=random.choice(comment_templates)
        )
        # Set created_at to various times after the post
        post_age_hours = (timezone.now() - post.created_at).total_seconds() / 3600
        hours_after_post = random.uniform(0.1, max(1, post_age_hours - 1))
        comment.created_at = post.created_at + timedelta(hours=hours_after_post)
        comment.save(update_fields=['created_at'])
        comments.append(comment)

print(f"  ✓ Created {len(comments)} top-level comments")

# Create nested replies
print("\n↩️ Creating nested replies...")
reply_templates = [
    "Exactly! You nailed it.",
    "I see what you mean now.",
    "That's a good point I hadn't considered.",
    "Wait, really? Can you explain more?",
    "Haha, so true!",
    "I respectfully disagree because...",
]

nested_comments = 0
for comment in comments[:20]:  # Add replies to first 20 comments
    if random.random() > 0.5:  # 50% chance of having a reply
        num_replies = random.randint(1, 3)
        for _ in range(num_replies):
            reply = Comment.objects.create(
                post=comment.post,
                author=random.choice(users),
                parent=comment,
                content=random.choice(reply_templates)
            )
            # Set created_at slightly after parent comment
            reply.created_at = comment.created_at + timedelta(minutes=random.randint(5, 120))
            reply.save(update_fields=['created_at'])
            nested_comments += 1
            
            # Sometimes add a nested reply to the reply
            if random.random() > 0.7:  # 30% chance
                nested_reply = Comment.objects.create(
                    post=comment.post,
                    author=random.choice(users),
                    parent=reply,
                    content=random.choice(reply_templates)
                )
                nested_reply.created_at = reply.created_at + timedelta(minutes=random.randint(5, 60))
                nested_reply.save(update_fields=['created_at'])
                nested_comments += 1

print(f"  ✓ Created {nested_comments} nested replies")

# Create likes on posts
print("\n❤️ Creating likes on posts...")
post_likes = 0
for post in posts:
    # Each post gets 0-6 likes
    num_likes = random.randint(0, 6)
    likers = random.sample(users, min(num_likes, len(users)))
    
    for liker in likers:
        like = Like.objects.create(
            user=liker,
            post=post
        )
        # Set created_at for likes in last 24 hours (for leaderboard testing)
        if random.random() > 0.3:  # 70% in last 24h
            hours_ago = random.uniform(0.1, 23.9)
            like.created_at = timezone.now() - timedelta(hours=hours_ago)
        else:  # 30% older than 24h
            hours_ago = random.uniform(24, 48)
            like.created_at = timezone.now() - timedelta(hours=hours_ago)
        like.save(update_fields=['created_at'])
        post_likes += 1

print(f"  ✓ Created {post_likes} post likes")

# Create likes on comments
print("\n❤️ Creating likes on comments...")
comment_likes = 0
all_comments = list(Comment.objects.all())
for comment in random.sample(all_comments, min(30, len(all_comments))):
    # Each comment gets 0-4 likes
    num_likes = random.randint(0, 4)
    likers = random.sample(users, min(num_likes, len(users)))
    
    for liker in likers:
        like = Like.objects.create(
            user=liker,
            comment=comment
        )
        # Set created_at for likes in last 24 hours
        if random.random() > 0.3:  # 70% in last 24h
            hours_ago = random.uniform(0.1, 23.9)
            like.created_at = timezone.now() - timedelta(hours=hours_ago)
        else:  # 30% older than 24h
            hours_ago = random.uniform(24, 48)
            like.created_at = timezone.now() - timedelta(hours=hours_ago)
        like.save(update_fields=['created_at'])
        comment_likes += 1

print(f"  ✓ Created {comment_likes} comment likes")

# Update like counts
print("\n🔄 Updating like counts...")
from django.db.models import Count
for post in Post.objects.all():
    post.like_count = post.likes.count()
    post.save(update_fields=['like_count'])

for comment in Comment.objects.all():
    comment.like_count = comment.likes.count()
    comment.save(update_fields=['like_count'])

print("  ✓ Like counts updated")

# Print summary
print("\n" + "="*50)
print("✅ DATABASE SEEDING COMPLETED!")
print("="*50)
print(f"\nCreated:")
print(f"  • {User.objects.count()} users")
print(f"  • {Post.objects.count()} posts")
print(f"  • {Comment.objects.count()} comments")
print(f"  • {Like.objects.count()} likes")
print(f"\n👉 You can now login with any username (alice, bob, charlie, etc.)")
print(f"   Password: password123")
print(f"\n🌐 Visit http://localhost:8000/admin/ to view the admin panel")
print(f"   Create a superuser first: python manage.py createsuperuser")
