import apiClient from './api';

const AuthService = {
  login: async (username, password) => {
    const response = await apiClient.post('token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      return response.data;
    }
  },
  
  register: async (userData) => {
    return apiClient.post('register/', userData);
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: () => {
    return apiClient.get('users/current/');
  }
};

export default AuthService;
