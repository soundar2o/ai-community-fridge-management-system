import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attach JWT token & handle FormData headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If payload is FormData, delete Content-Type to allow Axios/browser to set boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Selective Error Handling (Never auto-logout on non-auth app errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config ? error.config.url : '';
      const isAuthMe = url.includes('/auth/me');
      const isLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');

      // Only logout if fetching current user fails due to expired/invalid JWT token
      if (isAuthMe && !isLoginOrRegister) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
