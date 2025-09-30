import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let logoutHandler = null;
export const setAuthLogoutHandler = (fn) => {
  logoutHandler = fn;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor -> global 401 handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized (401) — token may be invalid/expired.");
      if (logoutHandler) logoutHandler(); // ✅ call logout from AuthProvider
    }
    return Promise.reject(error);
  }
);

export default api;
