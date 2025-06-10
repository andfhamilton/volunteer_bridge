import apiClient from './api';

const AuthService = {
  // src/services/auth.service.js
login: async (username, password) => {
  try {
    const response = await apiClient.post('token/', { username, password });
    console.log('Token response:', response.data); // Debug log
    
    if (response.data && response.data.access) {
      // Store token without any extra processing
      localStorage.setItem('token', response.data.access);
      return response.data;
    } else {
      console.error('No access token in response:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
},
  
  register: async (userData) => {
    console.log('Registering user with data:', userData);
    
    try {
      return await apiClient.post('register/', userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    
    try {
      // Try the new profile endpoint
      return await apiClient.get('profile/');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default AuthService;
// This service handles authentication-related API calls.