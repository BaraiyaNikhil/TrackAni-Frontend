// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request interceptor → attach JWT if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt"); // we’ll store token under 'jwt'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response interceptor → handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("JWT expired or unauthorized. Redirecting to login...");
      // Optionally clear token + redirect:
      localStorage.removeItem("jwt");
      // window.location.href = "/login"; // enable if you want auto-redirect
    }
    return Promise.reject(error);
  }
);

export default api;
