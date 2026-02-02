import React, { useState, useEffect } from 'react';
import { feedAPI } from '../api';
import Post from './Post';

const Feed = ({ onPostCreated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
    // Check if username exists in localStorage
    const savedUsername = localStorage.getItem('playto_username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setShowUsernamePrompt(true);
    }
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

    setCreating(true);
    try {
      await feedAPI.createPost(newPostContent, username);
      setNewPostContent('');
      setShowCreateForm(false);
      loadPosts();
      onPostCreated && onPostCreated();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post.');
    } finally {
      setCreating(false);
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('playto_username', username);
      setShowUsernamePrompt(false);
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
      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome! 👋</h2>
            <p className="text-gray-600 mb-6">Please enter your name to get started:</p>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full p-4 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                autoFocus
                required
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg hover:from-blue-600 hover:to-sky-500 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Post Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-400 rounded-full flex items-center justify-center text-white font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-700">{username}</span>
            <button
              onClick={() => {
                localStorage.removeItem('playto_username');
                setUsername('');
                setShowUsernamePrompt(true);
              }}
              className="ml-3 text-xs text-blue-500 hover:text-blue-600"
            >
              Change Name
            </button>
          </div>
        </div>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full text-left px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md"
          >
            💭 What's on your mind? Share with the community...
          </button>
        ) : (
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something interesting..."
              className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none transition-all duration-200"
              rows="4"
              autoFocus
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {newPostContent.length}/500 characters
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPostContent('');
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPostContent.trim()}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-500 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    '✨ Publish Post'
                  )}
                </button>
              </div>
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
          <Post key={post.id} post={post} onUpdate={() => { loadPosts(); onPostCreated && onPostCreated(); }} />
        ))
      )}
    </div>
  );
};

export default Feed;
