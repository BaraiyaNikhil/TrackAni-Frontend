// src/services/authService.js
import api from "../api/api";

export async function loginAPI({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // expect { token, user }
}

export async function registerAPI({ username, email, password }) {
  const res = await api.post("/auth/register", { username, email, password });
  return res.data; // expect { token, user }
}
