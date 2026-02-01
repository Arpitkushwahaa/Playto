import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const feedAPI = {
  // Posts
  getPosts: () => api.get('/posts/'),
  getPost: (id) => api.get(`/posts/${id}/`),
  createPost: (content, username) => api.post('/posts/', { content, username }),
  likePost: (id) => api.post(`/posts/${id}/like/`),
  unlikePost: (id) => api.post(`/posts/${id}/unlike/`),
  
  // Comments
  getComments: (postId) => api.get(`/comments/?post_id=${postId}`),
  createComment: (postId, content, parentId = null, username = null) => 
    api.post('/comments/', { post: postId, content, parent: parentId, username }),
  likeComment: (id) => api.post(`/comments/${id}/like/`),
  unlikeComment: (id) => api.post(`/comments/${id}/unlike/`),
  
  // Leaderboard
  getLeaderboard: () => api.get('/leaderboard/top_users/'),
  
  // Users
  getUser: (id) => api.get(`/users/${id}/`),
  getCurrentUser: () => api.get('/users/me/'),
};

export default api;
