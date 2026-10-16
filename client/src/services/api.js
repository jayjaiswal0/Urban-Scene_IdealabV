import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('umcp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 unauth
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired and not on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('umcp_token');
        localStorage.removeItem('umcp_user');
      }
    }
    const message = error.response?.data?.error?.message || error.message || 'Server error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
