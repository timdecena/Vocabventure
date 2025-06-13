import axios from "axios";

// Base URL for all API requests (points to your backend's API root)
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false, // Set to true only if your backend uses cookies
});

// Skip authentication for login and register endpoints
api.interceptors.request.use(
  (config) => {
    // Don't add auth headers for auth endpoints
    if (config.url && (config.url.includes('/api/auth/login') || 
                        config.url.includes('/api/auth/register') ||
                        config.url.includes('/api/auth/validate') ||
                        config.url.includes('/api/auth/refresh'))) {
      console.log('Skipping auth headers for auth endpoint:', config.url);
      return config;
    }
    
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // Enhanced debugging for authentication issues
    console.log("API Request:", config.url);
    console.log("User role:", role);
    
    if (token) {
      // Make sure token is properly formatted with Bearer prefix
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers.Authorization = authHeader;
      console.log("Authorization header set:", authHeader.substring(0, 20) + "...");
      
      // Add role to headers for debugging (optional)
      if (role) {
        config.headers["X-User-Role"] = role;
      }
    } else {
      // Only warn for non-auth endpoints
      console.warn("No authentication token found in localStorage");
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler for all API responses
api.interceptors.response.use(
  (response) => {
    // Log successful API responses for debugging
    console.log(`API Success [${response.status}]:`, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || 'unknown endpoint';
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      
      if (status === 401) {
        // Unauthorized: clear token and (optional) redirect to login
        localStorage.removeItem("token");
        console.error(`Authentication error [${status}] ${method} ${url}: Not logged in or token expired.`);
        console.error('Response data:', error.response.data);
        
        // Check if token exists but is invalid
        const token = localStorage.getItem("token");
        if (token) {
          console.warn('Token exists but is invalid or expired. Token starts with:', 
                      token.substring(0, 20) + '...');
        }
      } else if (status === 403) {
        console.error(`Authorization error [${status}] ${method} ${url}: No permission for this action.`);
        console.error('Response data:', error.response.data);
        
        // Log role information for debugging
        const role = localStorage.getItem("role");
        console.warn(`Current user role: ${role || 'none'}`);
        console.warn('This might be a role mismatch or missing ROLE_ prefix in the JWT token');
      } else {
        console.error(`API Error [${status}] ${method} ${url}:`, error.response.data);
      }
    } else if (error.request) {
      console.error("API Error: No response received", error.request);
    } else {
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Auth utility for checking if a token exists
api.isAuthenticated = () => !!localStorage.getItem("token");

export default api;
