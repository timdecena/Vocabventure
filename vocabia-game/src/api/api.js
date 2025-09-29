import axios from "axios";

// Use env variable if available, fallback to localhost
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  withCredentials: true,
});

//const api = axios.create({
//  baseURL: process.env.REACT_APP_API_URL || "/",
// withCredentials: true,
//});

// Enhanced request interceptor with better debugging
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    console.log("🔐 API Request Interceptor:");
    console.log("  - URL:", config.baseURL + config.url);
    console.log("  - Method:", config.method?.toUpperCase());
    console.log("  - Token exists:", !!token);
    console.log("  - User role:", role);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("  - Authorization header set");
    } else {
      console.warn("  - ⚠️ No token found in localStorage");
    }

    // Add role header for debugging
    if (role) {
      config.headers["X-User-Role"] = role;
    }

    return config;
  },
  error => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  response => {
    console.log("✅ API Response Success:", response.status, response.config.url);
    return response;
  },
  error => {
    console.error("❌ API Response Error:");
    console.error("  - Status:", error.response?.status);
    console.error("  - URL:", error.config?.url);
    console.error("  - Method:", error.config?.method?.toUpperCase());

    if (error.response?.status === 403) {
      console.error("  - 🚫 403 FORBIDDEN: Check user role and permissions");
      console.error("  - Current role:", localStorage.getItem("role"));
      console.error("  - Token exists:", !!localStorage.getItem("token"));
    } else if (error.response?.status === 401) {
      console.error("  - 🔒 401 UNAUTHORIZED: Token may be invalid or expired");
    } else if (error.response?.status === 500) {
      console.error("  - 🔥 500 SERVER ERROR: Backend processing failed");
      console.error("  - Error data:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;
