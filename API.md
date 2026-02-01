# API Documentation

Complete API reference for the Community Feed application.

## Base URL

- Development: `http://localhost:8000/api`
- Production: `https://your-domain.com/api`

## Authentication

Currently using simplified authentication for demo purposes. In production, implement JWT or session-based auth.

## Endpoints

### Posts

#### List Posts
```
GET /posts/
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "author": {
        "id": 1,
        "username": "alice",
        "email": "alice@example.com"
      },
      "content": "This is a post!",
      "created_at": "2026-01-31T10:30:00Z",
      "updated_at": "2026-01-31T10:30:00Z",
      "like_count": 5,
      "comment_count": 3,
      "comments": [...]
    }
  ]
}
```

#### Create Post
```
POST /posts/
```

**Request Body:**
```json
{
  "content": "My new post content"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "author": {...},
  "content": "My new post content",
  "created_at": "2026-01-31T11:00:00Z",
  "like_count": 0,
  "comment_count": 0,
  "comments": []
}
```

#### Get Single Post
```
GET /posts/{id}/
```

**Response:**
```json
{
  "id": 1,
  "author": {...},
  "content": "This is a post!",
  "created_at": "2026-01-31T10:30:00Z",
  "like_count": 5,
  "comment_count": 3,
  "comments": [
    {
      "id": 1,
      "author": {...},
      "content": "Great post!",
      "created_at": "2026-01-31T10:35:00Z",
      "like_count": 2,
      "depth": 0,
      "replies": [
        {
          "id": 2,
          "author": {...},
          "content": "I agree!",
          "depth": 1,
          "replies": []
        }
      ]
    }
  ]
}
```

#### Like Post
```
POST /posts/{id}/like/
```

**Response:** `201 Created`
```json
{
  "detail": "Post liked successfully.",
  "like_count": 6
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "You have already liked this post."
}
```

#### Unlike Post
```
POST /posts/{id}/unlike/
```

**Response:** `200 OK`
```json
{
  "detail": "Post unliked successfully.",
  "like_count": 5
}
```

---

### Comments

#### List Comments
```
GET /comments/
GET /comments/?post_id={post_id}
```

**Query Parameters:**
- `post_id` (optional): Filter comments by post

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "author": {...},
      "post": 1,
      "parent": null,
      "content": "Great post!",
      "created_at": "2026-01-31T10:35:00Z",
      "like_count": 2,
      "depth": 0,
      "replies": [...]
    }
  ]
}
```

#### Create Comment
```
POST /comments/
```

**Request Body (Top-level comment):**
```json
{
  "post": 1,
  "content": "This is a comment"
}
```

**Request Body (Reply to comment):**
```json
{
  "post": 1,
  "parent": 5,
  "content": "This is a reply"
}
```

**Response:** `201 Created`
```json
{
  "id": 10,
  "author": {...},
  "post": 1,
  "parent": 5,
  "content": "This is a reply",
  "created_at": "2026-01-31T11:00:00Z",
  "like_count": 0,
  "depth": 1,
  "replies": []
}
```

#### Like Comment
```
POST /comments/{id}/like/
```

**Response:** `201 Created`
```json
{
  "detail": "Comment liked successfully.",
  "like_count": 3
}
```

#### Unlike Comment
```
POST /comments/{id}/unlike/
```

**Response:** `200 OK`
```json
{
  "detail": "Comment unliked successfully.",
  "like_count": 2
}
```

---

### Leaderboard

#### Get Top Users (24h)
```
GET /leaderboard/top_users/
```

**Response:**
```json
[
  {
    "user_id": 1,
    "username": "alice",
    "karma": 35,
    "post_karma": 30,
    "comment_karma": 5
  },
  {
    "user_id": 2,
    "username": "bob",
    "karma": 22,
    "post_karma": 15,
    "comment_karma": 7
  },
  ...
]
```

**Karma Calculation:**
- Post like = 5 karma
- Comment like = 1 karma
- Only counts likes from the last 24 hours

---

### Users

#### List Users
```
GET /users/
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "first_name": "Alice",
      "last_name": "Smith"
    }
  ]
}
```

#### Get User
```
GET /users/{id}/
```

**Response:**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Smith"
}
```

#### Get Current User
```
GET /users/me/
```

**Response:**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Smith"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (creation)
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Not currently implemented. For production, consider:
- Django Ratelimit
- DRF throttling
- API Gateway rate limiting

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

**Response includes:**
```json
{
  "count": 100,
  "next": "http://api.example.com/posts/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## CORS

CORS is enabled for development. In production, configure allowed origins in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

---

## WebSocket Support (Future)

For real-time updates, consider implementing Django Channels:
- Real-time comment updates
- Live leaderboard changes
- Notification system

---

## Testing the API

### Using cURL

```bash
# Get posts
curl http://localhost:8000/api/posts/

# Create post (requires authentication in production)
curl -X POST http://localhost:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -d '{"content": "My new post"}'

# Like a post
curl -X POST http://localhost:8000/api/posts/1/like/
```

### Using Postman

1. Import the API base URL
2. Create requests for each endpoint
3. Test different scenarios

### Using Python

```python
import requests

# Get posts
response = requests.get('http://localhost:8000/api/posts/')
posts = response.json()

# Create post
response = requests.post(
    'http://localhost:8000/api/posts/',
    json={'content': 'My new post'}
)

# Get leaderboard
response = requests.get('http://localhost:8000/api/leaderboard/top_users/')
leaderboard = response.json()
```

---

## GraphQL (Future Enhancement)

Consider adding GraphQL with Graphene-Django for more flexible queries:
- Reduce over-fetching
- Allow clients to request exact data needed
- Improve performance for complex nested queries

---

## API Versioning (Future)

For backward compatibility:

```
/api/v1/posts/
/api/v2/posts/
```

Implement using DRF's versioning:
```python
REST_FRAMEWORK = {
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning'
}
```

---

## Security Best Practices

1. **Authentication**: Implement JWT or OAuth2
2. **HTTPS**: Always use HTTPS in production
3. **CSRF Protection**: Enable for state-changing operations
4. **SQL Injection**: Use ORM (already protected)
5. **XSS**: Sanitize user input
6. **Rate Limiting**: Prevent abuse

---

For more details, see the [Django REST Framework documentation](https://www.django-rest-framework.org/).
