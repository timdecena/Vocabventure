import axios from "axios";

// Base URL for all API requests (points to your backend's API root)
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false, // Set to true only if your backend uses cookies
});

// Add JWT token to every request (if it exists)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Optional: Uncomment for debugging token
      // console.log("Token attached to request:", token.substring(0, 15) + "...");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler for all API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Unauthorized: clear token and (optional) redirect to login
        localStorage.removeItem("token");
        // window.location.href = "/login";
        console.warn("Authentication error: Not logged in or token expired.");
      } else if (status === 403) {
        console.warn("Authorization error: No permission for this action.");
      }
      // Optionally log error data
      // console.error(`API Error: ${status}`, error.response.data);
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
