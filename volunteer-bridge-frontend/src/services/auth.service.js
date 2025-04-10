import apiClient from './api';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('token/', { username, password });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
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