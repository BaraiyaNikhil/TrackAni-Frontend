// src/pages/Animes.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import AnimeCard from "../components/AnimeCard";

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
  if (!s) return s;
  return String(s).toLowerCase().trim().replace(/\s+/g, "-"); // "Plan to Watch" -> "plan-to-watch"
}

export default function Animes() {
  const [allShows, setAllShows] = useState([]); // master list from backend
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ genres: [], status: "" });
  const [search, setSearch] = useState("");
  const [watchlistMap, setWatchlistMap] = useState({}); // showId -> status
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // fetch shows + optionally watchlist
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shows");
      const shows = Array.isArray(res.data) ? res.data : res.data.shows || [];
      setAllShows(shows);
    } catch (err) {
      console.error("Error fetching shows:", err);
      setAllShows([]);
    }

    // try fetch watchlist if JWT exists
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        const wlRes = await api.get("/watchlist");
        const items = Array.isArray(wlRes.data)
          ? wlRes.data
          : wlRes.data.items || [];
        const map = {};
        items.forEach((it) => {
          const showObj = it.show ?? it.showId ?? it.show_id ?? it.title;
          let showId =
            getIdFromObj(showObj) ||
            getIdFromObj(it.show) ||
            getIdFromObj(it._id) ||
            getIdFromObj(it.id);
          if (!showId && it.show && typeof it.show === "object") {
            showId = getIdFromObj(it.show);
          }
          if (!showId && it._id && it._id.$oid) showId = it._id.$oid;

          const status = normalizeStatus(
            it.status ?? it.watchStatus ?? it.state ?? ""
          );
          if (showId) map[showId] = status;
        });
        setWatchlistMap(map);
      } else {
        setWatchlistMap({});
      }
    } catch (err) {
      console.warn(
        "Could not fetch watchlist (unauth or missing token).",
        err?.response?.status
      );
      setWatchlistMap({});
    } finally {
      setIsAuthChecked(true);
      setLoading(false);
    }
  };

  // initial fetch once
  useEffect(() => {
    fetchAll();
  }, []);

  // compute filtered results client-side
  const filteredShows = useMemo(() => {
    const q = search?.toString().trim().toLowerCase();

    return allShows.filter((anime) => {
      const id = getIdFromObj(anime._id ?? anime.id ?? anime);

      // 1) search
      if (q) {
        const title = (anime.title ?? "").toLowerCase();
        const synopsis = (anime.synopsis ?? "").toLowerCase();
        if (!title.includes(q) && !synopsis.includes(q)) return false;
      }

      // 2) genres
      if (filters?.genres?.length) {
        const animeGenres = (anime.genres ?? []).map((g) => g.toLowerCase());
        const wanted = filters.genres.map((g) => g.toLowerCase());
        const hasAny = wanted.some((wg) => animeGenres.includes(wg));
        if (!hasAny) return false;
      }

      // 3) watch status
      if (filters?.status) {
        const status = watchlistMap[id];
        if (!status) return false;
        if (status !== normalizeStatus(filters.status)) return false;
      }

      return true;
    });
  }, [allShows, search, filters, watchlistMap]);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar for large screens */}
      <div className="lg:w-72 px-4 lg:px-6 py-6 hidden lg:block">
        <Filter onFilterChange={setFilters} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8">
        {/* Search + actions */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <SearchBar
              placeholder="Search anime, e.g. One Piece..."
              value={search}
              onSearch={(q) => setSearch(q)}
              onChange={(q) => setSearch(q)}
            />
          </div>

          <div className="w-full md:w-1/3 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition"
              onClick={fetchAll}
            >
              Refresh
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
              onClick={() => {
                setSearch("");
                setFilters({ genres: [], status: "" });
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-slate-600 dark:text-slate-400">Loading shows...</p>
        ) : filteredShows.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center">
            No shows found. Try clearing filters or clicking Refresh.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredShows.map((anime) => {
              const id = getIdFromObj(anime._id ?? anime.id ?? anime);
              return <AnimeCard key={id || anime.title} anime={anime} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
