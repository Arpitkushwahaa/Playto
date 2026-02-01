import React, { useState, useEffect } from 'react';
import { feedAPI } from '../api';
import Post from './Post';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await feedAPI.getPosts();
      setPosts(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await feedAPI.createPost(newPostContent);
      setNewPostContent('');
      setShowCreateForm(false);
      loadPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please make sure you are logged in.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadPosts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Create Post Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
          >
            What's on your mind?
          </button>
        ) : (
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="4"
              autoFocus
            />
            <div className="flex space-x-2 mt-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPostContent('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Post key={post.id} post={post} onUpdate={loadPosts} />
        ))
      )}
    </div>
  );
};

export default Feed;
