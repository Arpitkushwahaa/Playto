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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{post.author.username}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            isLiked
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <svg
            className={`w-5 h-5 ${isLiked ? 'animate-pulse' : ''}`}
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
          <span>{post.like_count} {post.like_count === 1 ? 'Like' : 'Likes'}</span>
        </button>

        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{post.comment_count || 0} {post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
        </button>

        {post.comments && post.comments.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-semibold"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{isExpanded ? 'Hide Comments' : 'View Comments'}</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleComment} className="mb-4 bg-purple-50 rounded-lg p-4 border border-purple-100">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="💬 Write a thoughtful comment..."
            className="w-full p-4 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="3"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">{commentContent.length}/300 characters</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCommentForm(false);
                  setCommentContent('');
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!commentContent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💬 Comment
              </button>
            </div>
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
