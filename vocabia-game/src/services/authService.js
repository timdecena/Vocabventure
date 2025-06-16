import api from '../api/api';

/**
 * Authentication service for handling user authentication state and operations
 */
const authService = {
  /**
   * Check if user is authenticated by verifying token exists in localStorage
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get the current user's role from localStorage
   * @returns {string|null} User role or null if not available
   */
  getRole: () => {
    return localStorage.getItem('role');
  },

  /**
   * Get the JWT token from localStorage
   * @returns {string|null} JWT token or null if not available
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Set authentication data in localStorage
   * @param {string} token - JWT token
   * @param {string} role - User role
   */
  setAuth: (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  },

  /**
   * Clear authentication data from localStorage
   */
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },

  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Promise resolving to login response
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },

  /**
   * Validate and refresh token if needed
   * @returns {Promise} Promise resolving to validation result
   */
  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { valid: false };
      
      const response = await api.post('/api/auth/validate', { token });
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }
};

export default authService;
