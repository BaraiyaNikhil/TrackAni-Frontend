import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import {
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../services/watchlistService";

/* Helpers to read various id shapes */
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

function normalizeStatus(s) {
  if (!s) return "plan-to-watch";
  return String(s).toLowerCase().trim().replace(/\s+/g, "-");
}

/** Small UI helpers */
function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-sm text-slate-500 dark:text-slate-300">{title}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-bold text-black dark:text-white">
          {value}
        </div>
        {hint && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // normalized watchlist items: { id, status, episodesWatched, show }
  const [busyItem, setBusyItem] = useState(null);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWatchlist();
      const list = Array.isArray(res) ? res : res.items ?? res.data ?? res;

      const normalized = await Promise.all(
        (list || []).map(async (it) => {
          const itemId =
            getIdFromObj(it._id) ||
            getIdFromObj(it.id) ||
            getIdFromObj(it._id?.$oid) ||
            null;

          const status = normalizeStatus(
            it.status ?? it.watchStatus ?? it.state ?? "plan-to-watch"
          );

          const episodesWatched =
            it.episodesWatched ??
            it.episodes_watched ??
            it.episodes ??
            (typeof it.episodesWatched === "number" ? it.episodesWatched : 0);

          // resolve show object (populated or id)
          let showObj = it.show ?? it.showId ?? it.show_id ?? null;

          // if it's a string id, try to fetch show details
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

          if (!showObj && it.showId && typeof it.showId === "object") {
            showObj = it.showId;
          }

          // fallback: item itself may contain show fields
          if (!showObj) {
            showObj = {
              _id: it.show?._id ?? itemId ?? null,
              title: it.title ?? "Unknown",
              poster: it.poster ?? "",
              synopsis: it.synopsis ?? "",
              releaseYear: it.releaseYear ?? it.year ?? undefined,
              totalEpisodes: it.totalEpisodes ?? undefined,
            };
          }

          if (!showObj._id) showObj._id = showObj.id ?? itemId ?? null;

          return {
            id: itemId,
            status,
            episodesWatched: Number(episodesWatched || 0),
            show: showObj,
            raw: it,
          };
        })
      );

      setItems(normalized);
    } catch (err) {
      console.error("Failed loading watchlist for dashboard:", err);
      setError(err);
      // If unauthorized, redirect to login
      if (err?.response?.status === 401) {
        navigate("/login", { state: { from: { pathname: "/profile" } } });
        return;
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
      return;
    }
    fetchWatchlist();
  }, [isAuthenticated, fetchWatchlist, navigate]);

  const stats = useMemo(() => {
    const totals = {
      total: items.length,
      watching: 0,
      completed: 0,
      planToWatch: 0,
      onHold: 0,
      dropped: 0,
      episodesWatched: 0,
      totalEpisodes: 0,
      genres: {},
    };

    items.forEach((it) => {
      const s = it.status;
      if (s === "watching") totals.watching++;
      else if (s === "completed") totals.completed++;
      else if (s === "plan-to-watch") totals.planToWatch++;
      else if (s === "on-hold") totals.onHold++;
      else if (s === "dropped") totals.dropped++;

      totals.episodesWatched += Number(it.episodesWatched || 0);
      const te = Number(it.show?.totalEpisodes || 0);
      totals.totalEpisodes += te;

      (it.show?.genres || []).forEach((g) => {
        const key = (g || "").toString();
        if (!key) return;
        totals.genres[key] = (totals.genres[key] || 0) + 1;
      });
    });

    totals.percentWatched =
      totals.totalEpisodes > 0
        ? Math.round((totals.episodesWatched / totals.totalEpisodes) * 100)
        : 0;

    totals.topGenres = Object.entries(totals.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((x) => x[0]);

    return totals;
  }, [items]);

  /* update episodes watched (optimistic) */
  const updateEpisodes = async (itemId, newEp) => {
    setBusyItem(itemId);
    const prev = items;
    const target = items.find((it) => it.id === itemId);
    if (!target) {
      setBusyItem(null);
      return;
    }
    const totalEps = Number(target.show?.totalEpisodes || 0);
    // if newEp exceeds total episodes, clamp
    const clamped =
      Number.isFinite(totalEps) && totalEps > 0
        ? Math.min(newEp, totalEps)
        : newEp;
    const newStatus =
      totalEps && clamped >= totalEps ? "completed" : target.status;

    // optimistic update
    setItems((cur) =>
      cur.map((it) =>
        it.id === itemId
          ? { ...it, episodesWatched: clamped, status: newStatus }
          : it
      )
    );
    try {
      await updateWatchlistItem(itemId, {
        episodesWatched: clamped,
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update episodes:", err);
      alert("Could not update progress. Try again.");
      setItems(prev); // rollback
    } finally {
      setBusyItem(null);
    }
  };

  const changeStatus = async (itemId, newStatus) => {
    setBusyItem(itemId);
    const prev = items;
    setItems((cur) =>
      cur.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
    );
    try {
      await updateWatchlistItem(itemId, { status: newStatus });
    } catch (err) {
      console.error("Failed update status:", err);
      alert("Could not update status. Try again.");
      setItems(prev);
    } finally {
      setBusyItem(null);
    }
  };

  const quickRemove = async (itemId) => {
    if (!confirm("Remove this from your watchlist?")) return;
    setBusyItem(itemId);
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== itemId));
    try {
      await removeFromWatchlist(itemId);
    } catch (err) {
      console.error("Failed remove:", err);
      alert("Could not remove item. Try again.");
      setItems(prev);
    } finally {
      setBusyItem(null);
    }
  };

  const watchingList = useMemo(
    () => items.filter((it) => it.status === "watching"),
    [items]
  );
  const recentAdds = useMemo(() => [...items].slice(0, 6), [items]);

  if (loading) {
    return (
      <div className="p-8 text-slate-600 dark:text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold">
            {user?.username?.[0]?.toUpperCase() ??
              user?.email?.[0]?.toUpperCase() ??
              "U"}
          </div>
          <div>
            <div className="text-xl font-bold text-black dark:text-white">
              {user?.username ?? user?.email}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "long time"}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchWatchlist}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Shows on Watchlist"
          value={stats.total}
          hint={`${stats.watching} watching`}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          hint={`${stats.percentWatched}% overall progress`}
        />
        <StatCard
          title="Episodes Watched"
          value={stats.episodesWatched}
          hint={`${stats.totalEpisodes} total episodes`}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column - progress & watching */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Watching ({watchingList.length})
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Keep track of episodes
              </div>
            </div>

            {watchingList.length === 0 ? (
              <div className="text-slate-600 dark:text-slate-400 p-6 rounded-md bg-slate-50 dark:bg-slate-900">
                You are not currently watching any shows. Add some from their
                details pages!
              </div>
            ) : (
              <div className="space-y-4">
                {watchingList.map((it) => {
                  const totalEps = Number(it.show?.totalEpisodes || 0);
                  const pct =
                    totalEps > 0
                      ? Math.round((it.episodesWatched / totalEps) * 100)
                      : 0;
                  return (
                    <div
                      key={it.id || it.show?._id}
                      className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                    >
                      <img
                        src={it.show.poster}
                        alt={it.show.title}
                        className="w-20 h-28 object-cover rounded-md cursor-pointer"
                        onClick={() =>
                          navigate(`/animes/${getIdFromObj(it.show._id)}`)
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-black dark:text-white">
                              {it.show.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {it.show.releaseYear ?? ""} •{" "}
                              {it.show.genres?.slice(0, 3).join(", ")}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {pct}%
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              style={{
                                width: `${Math.min(Math.max(pct, 0), 100)}%`,
                              }}
                              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all"
                            />
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                              {it.episodesWatched}/{totalEps || "?"} eps
                            </div>

                            {/* episode controls */}
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                disabled={busyItem === it.id}
                                onClick={() =>
                                  updateEpisodes(
                                    it.id,
                                    Math.max(0, it.episodesWatched - 1)
                                  )
                                }
                                className="px-2 py-1 rounded-md border text-sm"
                              >
                                -
                              </button>
                              <button
                                disabled={busyItem === it.id}
                                onClick={() =>
                                  updateEpisodes(it.id, it.episodesWatched + 1)
                                }
                                className="px-2 py-1 rounded-md border text-sm"
                              >
                                +
                              </button>

                              <button
                                onClick={() => changeStatus(it.id, "completed")}
                                disabled={busyItem === it.id}
                                className="px-3 py-1 rounded-md bg-green-600 text-white text-sm"
                                title="Mark completed"
                              >
                                Mark Completed
                              </button>

                              <button
                                onClick={() => quickRemove(it.id)}
                                disabled={busyItem === it.id}
                                className="px-3 py-1 rounded-md border border-red-500 text-red-600 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent & Completed list */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-black dark:text-white mb-3">
              Recent additions
            </h3>
            {recentAdds.length === 0 ? (
              <div className="text-slate-600 dark:text-slate-400">
                No recent activity.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentAdds.map((it) => (
                  <div
                    key={it.id || it.show?._id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                    onClick={() =>
                      navigate(`/animes/${getIdFromObj(it.show._id)}`)
                    }
                  >
                    <img
                      src={it.show.poster}
                      alt={it.show.title}
                      className="w-12 h-16 object-cover rounded-md"
                    />
                    <div>
                      <div className="font-medium text-black dark:text-white">
                        {it.show.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {it.status} • {it.episodesWatched} eps
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - top genres & recommendations */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-semibold text-black dark:text-white mb-2">
              Top genres
            </h4>
            {stats.topGenres.length === 0 ? (
              <div className="text-slate-600 dark:text-slate-400">
                No genres yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.topGenres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-semibold text-black dark:text-white mb-2">
              Recommendations
            </h4>
            <Recommendations items={items} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Recommendations subcomponent: pick shows from the same top genres */
function Recommendations({ items }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // compute top genres from items
        const counts = {};
        items.forEach((it) => {
          (it.show?.genres || []).forEach((g) => {
            counts[g] = (counts[g] || 0) + 1;
          });
        });
        const top = Object.keys(counts)
          .sort((a, b) => counts[b] - counts[a])
          .slice(0, 2);

        // if no genres, just pick recent trending shows
        let url = "/shows";
        const q = top.length
          ? `?genres=${encodeURIComponent(top.join(","))}`
          : "";
        // We'll fetch /shows and filter client-side (safer across backends)
        const res = await api.get("/shows");
        const all = Array.isArray(res.data)
          ? res.data
          : res.data.shows ?? res.data;
        if (!mounted) return;
        // filter out those already in user's items
        const owned = new Set(
          items.map((it) => String(it.show?._id ?? it.show?.id))
        );
        const filtered = (all || [])
          .filter((s) => !owned.has(String(s._id ?? s.id)))
          .filter((s) => {
            if (!top.length) return true;
            const g = (s.genres || []).map((x) => x.toLowerCase());
            return g.some((gg) => top.map((t) => t.toLowerCase()).includes(gg));
          })
          .slice(0, 6);
        setRecs(filtered);
      } catch (err) {
        console.warn("Failed to load recommendations:", err);
        setRecs([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [items]);

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  if (!recs || recs.length === 0) {
    return (
      <div className="text-slate-600 dark:text-slate-400">
        No recommendations yet — add more shows to your list.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recs.map((r) => (
        <div key={r._id || r.id} className="flex items-center gap-3">
          <img
            src={r.poster}
            alt={r.title}
            className="w-12 h-16 object-cover rounded-md"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-black dark:text-white">
              {r.title}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {(r.genres || []).slice(0, 2).join(", ")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
