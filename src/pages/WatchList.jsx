import { useEffect, useState } from "react";
import api from "../api/api";
import {
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../services/watchlistService";
import WatchlistItem from "../components/WatchlistItem";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

/** Helper - read various id shapes */
function getIdFromObj(obj) {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  if (obj._id) {
    if (typeof obj._id === "string") return obj._id;
    if (obj._id.$oid) return obj._id.$oid;
  }
  if (obj.id) return obj.id;
  return null;
}

export default function Watchlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]); // normalized: { id, status, show, episodesWatched }
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await getWatchlist(); // service returns res.data or array
      const list = Array.isArray(res) ? res : res.items ?? res.data ?? [];

      // normalize each item
      const normalized = await Promise.all(
        list.map(async (it) => {
          const itemId =
            getIdFromObj(it._id) ||
            getIdFromObj(it.id) ||
            getIdFromObj(it._id?.$oid) ||
            null;

          const status = (
            it.status ??
            it.watchStatus ??
            it.state ??
            "plan-to-watch"
          )
            .toString()
            .toLowerCase();

          // episodesWatched may be present on the item
          const episodesWatched =
            Number(
              it.episodesWatched ??
                it.episodes_watched ??
                it.episodes ??
                it.episodesWatched === 0
                ? it.episodesWatched
                : undefined
            ) ?? 0;

          // prefer populated show object (we expect watchlist controller to populate showId)
          let showObj = it.show ?? it.showId ?? it.show_id ?? null;

          // if show is an id string -> try fetch details
          if (showObj && typeof showObj === "string") {
            try {
              const sres = await api.get(`/shows/${getIdFromObj(showObj)}`);
              showObj = sres.data;
            } catch {
              showObj = {
                _id: showObj,
                title: it.title ?? "Unknown",
                poster: it.poster ?? "",
              };
            }
          }

          // if showId present as object (populated as showId) - convert to show
          if (!showObj && it.showId && typeof it.showId === "object") {
            showObj = it.showId;
          }

          // fallback: maybe the watchlist item itself contains show fields
          if (!showObj) {
            showObj = {
              _id: it.show?._id ?? itemId ?? it.showId ?? null,
              title: it.title ?? "Unknown",
              poster: it.poster ?? "",
              synopsis: it.synopsis ?? "",
              releaseYear: it.releaseYear ?? it.year ?? undefined,
              totalEpisodes: it.totalEpisodes ?? undefined,
            };
          }

          // ensure show._id exists
          if (!showObj._id) showObj._id = showObj.id ?? itemId ?? null;

          return {
            id: itemId,
            status,
            episodesWatched: Number(episodesWatched || 0),
            show: showObj,
            rawItem: it, // keep raw for debugging if needed
          };
        })
      );

      setItems(normalized);
    } catch (err) {
      // if unauthorized - redirect to login with return location
      if (err?.response?.status === 401) {
        navigate("/login", { state: { from: location }, replace: true });
        return;
      }
      console.error("Error loading watchlist:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not authenticated, block access and redirect to login
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // optimistic update status
  const handleUpdateStatus = async (itemId, newStatus) => {
    setBusyItem(itemId);
    const prev = items;
    setItems((cur) =>
      cur.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
    );
    try {
      await updateWatchlistItem(itemId, { status: newStatus });
    } catch (err) {
      console.error("Failed updating status:", err);
      alert("Could not update status. Try again.");
      setItems(prev); // rollback
    } finally {
      setBusyItem(null);
    }
  };

  // optimistic update episodesWatched (also auto-completes if reached totalEpisodes)
  const handleUpdateEpisodes = async (itemId, newEpisodes) => {
    setBusyItem(itemId);
    const prev = items;
    const next = items.map((it) => {
      if (it.id !== itemId) return it;
      // compute potential status change
      const total = Number(
        it.show?.totalEpisodes ?? it.show?.totalEpisodes ?? NaN
      );
      let newStatus = it.status;
      if (!Number.isNaN(total) && total > 0 && newEpisodes >= total) {
        newStatus = "completed";
      } else if (
        it.status === "completed" &&
        (Number.isNaN(total) || newEpisodes < total)
      ) {
        // user reduced progress -> move away from completed
        newStatus = "watching";
      }
      return { ...it, episodesWatched: Number(newEpisodes), status: newStatus };
    });
    setItems(next);

    try {
      // find changed item to know whether we need to update status too
      const changed = next.find((i) => i.id === itemId);
      const body = { episodesWatched: Number(newEpisodes) };
      if (
        changed &&
        changed.status !== prev.find((p) => p.id === itemId)?.status
      ) {
        body.status = changed.status;
      }
      await updateWatchlistItem(itemId, body);
    } catch (err) {
      console.error("Failed updating episodes:", err);
      alert("Could not update episodes. Try again.");
      setItems(prev); // rollback
    } finally {
      setBusyItem(null);
    }
  };

  // optimistic remove
  const handleRemove = async (itemId) => {
    if (!confirm("Remove this show from your watchlist?")) return;
    setBusyItem(itemId);
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== itemId));
    try {
      await removeFromWatchlist(itemId);
    } catch (err) {
      console.error("Failed removing watchlist item:", err);
      alert("Could not remove item. Try again.");
      setItems(prev); // rollback
    } finally {
      setBusyItem(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-600 dark:text-slate-400">
        Loading watchlist...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          My Watchlist
        </h1>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {items.length} shows
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-slate-600 dark:text-slate-400">
          Your watchlist is empty. Add shows from their details page.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <WatchlistItem
              key={it.id || it.show?._id || it.show?.id}
              item={it}
              onUpdateStatus={handleUpdateStatus}
              onUpdateEpisodes={handleUpdateEpisodes}
              onRemove={handleRemove}
              busy={busyItem === it.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
