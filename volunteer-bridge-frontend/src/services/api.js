// src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials - it's not needed for JWT auth
});

// Add request interceptor with debug logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Using token for request:', token ? 'Yes (token exists)' : 'No (token missing)');
    
    if (token) {
      // Ensure correct format with Bearer prefix and space
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
// This file sets up an axios instance for API calls, including interceptors for authentication.