import api from "../api/api";

export async function loginAPI({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function registerAPI({ username, email, password }) {
  const res = await api.post("/auth/register", { username, email, password });
  return res.data;
}
