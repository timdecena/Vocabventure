import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  console.log("🔐 JWT token from localStorage:", token); // ✅ DEBUG LINE
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default api;
