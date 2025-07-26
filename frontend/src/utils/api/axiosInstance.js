// src/utils/api/axiosInstance.js
// This file sets up a pre-configured Axios instance for making API requests to your backend.
// It includes the base URL and can be extended with interceptors for auth tokens, etc.

import axios from 'axios';

// Get the backend API base URL from environment variables
// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
// Ensure your .env.local (or .env) file has a variable like: NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending/receiving cookies (like JWT token from backend)
});

// Optional: Add request interceptor to attach token from Redux state or localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if stored there)
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

// Optional: Add response interceptor to handle token expiration or 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: If a 401 Unauthorized error occurs, it might mean the token is expired
    // In a real application, you might dispatch a logout action here.
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: Token might be expired or invalid. Logging out...');
      // You would dispatch a Redux action here to log the user out
      // store.dispatch(logoutUser()); // Assuming logoutUser is an action
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
