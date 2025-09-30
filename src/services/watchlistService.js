import api from "../api/api";

export async function getWatchlist() {
  const res = await api.get("/watchlist");
  return res.data;
}

export async function addToWatchlist(showId, status = "plan-to-watch") {
  const body = { showId, status };
  const res = await api.post("/watchlist", body);
  return res.data;
}

export async function updateWatchlistItem(itemId, data) {
  const res = await api.patch(`/watchlist/${itemId}`, data);
  return res.data;
}

export async function removeFromWatchlist(itemId) {
  const res = await api.delete(`/watchlist/${itemId}`);
  return res.data;
}
