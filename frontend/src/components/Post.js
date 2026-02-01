import React, { useState } from 'react';
import { feedAPI } from '../api';
import Comment from './Comment';

const Post = ({ post: initialPost, onUpdate }) => {
  const [post, setPost] = useState(initialPost);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await feedAPI.unlikePost(post.id);
      } else {
        await feedAPI.likePost(post.id);
      }
      // Update like count
      setPost({
        ...post,
        like_count: isLiked ? post.like_count - 1 : post.like_count + 1,
      });
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await feedAPI.createComment(post.id, commentContent);
      setCommentContent('');
      setShowCommentForm(false);
      // Refresh the post to get updated comments
      const response = await feedAPI.getPost(post.id);
      setPost(response.data);
      onUpdate && onUpdate();
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  const handleCommentLike = async (commentId, like) => {
    try {
      if (like) {
        await feedAPI.likeComment(commentId);
      } else {
        await feedAPI.unlikeComment(commentId);
      }
      // Refresh the post to get updated comment counts
      const response = await feedAPI.getPost(post.id);
      setPost(response.data);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await feedAPI.createComment(post.id, content, parentId);
      // Refresh the post to get updated comments
      const response = await feedAPI.getPost(post.id);
      setPost(response.data);
    } catch (err) {
      console.error('Error creating reply:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{post.author.username}</p>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4 text-lg leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="font-semibold">{post.like_count} Likes</span>
        </button>

        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-semibold">{post.comment_count || 0} Comments</span>
        </button>

        {post.comments && post.comments.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleComment} className="mb-4">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows="4"
          />
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Post Comment
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCommentForm(false);
                setCommentContent('');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Comments Section */}
      {isExpanded && post.comments && post.comments.length > 0 && (
        <div className="mt-4">
          {post.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onLike={handleCommentLike}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
