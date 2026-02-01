import React, { useState } from 'react';

const Comment = ({ comment, onLike, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      await onLike(comment.id, !isLiked);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error replying to comment:', err);
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

  const maxDepth = 5;
  const indentClass = depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : '';

  return (
    <div className={`${indentClass} mb-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{comment.author.username}</p>
              <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
            </div>
          </div>
          {depth > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Level {depth}
            </span>
          )}
        </div>

        {/* Comment Content */}
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <svg
              className="w-5 h-5"
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
            <span className="font-medium">{comment.like_count}</span>
          </button>

          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex space-x-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
