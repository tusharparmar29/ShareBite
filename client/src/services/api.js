import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error extraction and handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';

    // If token expired/invalid (and not the login attempt itself), clear token
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
    }

    const customError = {
      status,
      message
    };
    return Promise.reject(customError);
  }
);

export default api;
