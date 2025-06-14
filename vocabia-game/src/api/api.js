import axios from "axios";

// Create an axios instance with the base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:8080", // Fixed to avoid duplicate /api prefix
  headers: {
    'Content-Type': 'application/json'
  },
  // Disable timeout for development troubleshooting
  timeout: 0,
  // Enable credentials for CORS requests
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  
  // Skip adding auth headers for login and register endpoints
  if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/register'))) {
    console.log(`🔓 Skipping auth header for ${config.url}`);
    return config;
  }
  
  console.log(`🔐 Request to ${config.url}`);
  console.log(`🔑 JWT token: ${token ? token.substring(0, 15) + '...' : 'No token'}`); 
  
  if (token) {
    // Ensure proper Bearer format
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log(`✅ Auth header set for ${config.url}`);
  } else {
    console.warn(`⚠️ No token available for ${config.url}`);
  }
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`✅ Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ Error ${error.response.status} from ${error.config?.url}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error(`❌ No response received for request to ${error.config?.url}`);
    } else {
      console.error(`❌ Request error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);


export default api;
