// src/services/clubsService.js
import api from "../api/api";

export async function listClubs() {
  const res = await api.get("/clubs");
  return res.data;
}

export async function getClub(id) {
  const res = await api.get(`/clubs/${id}`);
  return res.data;
}

export async function createClub(payload) {
  const res = await api.post("/clubs", payload);
  return res.data;
}

export async function joinClub(id) {
  const res = await api.post(`/clubs/${id}/join`);
  return res.data;
}

export async function createPost(clubId, payload) {
  const res = await api.post(`/clubs/${clubId}/posts`, payload);
  return res.data;
}

export async function commentOnPost(clubId, postId, payload) {
  const res = await api.post(`/clubs/${clubId}/posts/${postId}/comments`, payload);
  return res.data;
}

export async function deletePost(clubId, postId) {
  const res = await api.delete(`/clubs/${clubId}/posts/${postId}`);
  return res.data;
}

export async function deleteComment(clubId, postId, commentId) {
  const res = await api.delete(`/clubs/${clubId}/posts/${postId}/comments/${commentId}`);
  return res.data;
}

export async function deleteClub(clubId) {
  const res = await api.delete(`/clubs/${clubId}`);
  return res.data;
}
