import api from '../api/api';

/**
 * Authentication service for handling login, logout, and token management
 */
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise with login response
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Store token and role in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('email', response.data.email);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with registration response
   */
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has a token
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Check if user has a specific role
   * @param {string} requiredRole - Role to check for
   * @returns {boolean} - True if user has the required role
   */
  hasRole: (requiredRole) => {
    const userRole = localStorage.getItem('role');
    return userRole === requiredRole;
  },
  
  /**
   * Get current user role
   * @returns {string|null} - User role or null if not logged in
   */
  getRole: () => {
    return localStorage.getItem('role');
  },
  
  /**
   * Get current user ID
   * @returns {string|null} - User ID or null if not logged in
   */
  getUserId: () => {
    return localStorage.getItem('userId');
  },
  
  /**
   * Get current user email
   * @returns {string|null} - User email or null if not logged in
   */
  getEmail: () => {
    return localStorage.getItem('email');
  },
  
  /**
   * Get current authentication token
   * @returns {string|null} - Auth token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
