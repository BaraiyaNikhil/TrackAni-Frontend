import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../services/watchlistService";

function normalizeStatus(s) {
  if (!s) return "plan-to-watch";
  return String(s).toLowerCase().trim().replace(/\s+/g, "-");
}

export default function AnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchItem, setWatchItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [similar, setSimilar] = useState([]);

  // fetch show + check watchlist
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await api.get(`/shows/${id}`);
        if (mounted) setAnime(res.data);
      } catch (err) {
        console.error("Error fetching anime:", err);
        if (mounted) setAnime(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    (async () => {
      if (!isAuthenticated) {
        setWatchItem(null);
        return;
      }
      try {
        const wl = await getWatchlist();
        const found = wl.find((it) => String(it.show?._id) === String(id));
        if (found) {
          setWatchItem({
            id: found.id,
            status: normalizeStatus(found.status),
            show: found.show,
          });
        } else {
          setWatchItem(null);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login", { state: { from: location }, replace: true });
        } else {
          console.warn("Could not fetch watchlist:", err);
        }
        setWatchItem(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isAuthenticated, navigate, location]);

  // fetch similar
  useEffect(() => {
    if (!anime) return;
    (async () => {
      try {
        const sres = await api.get("/shows");
        const all = Array.isArray(sres.data) ? sres.data : [];
        const curGenres = (anime.genres ?? []).map((g) => g.toLowerCase());
        const filtered = all
          .filter(
            (s) =>
              String(s._id) !== String(id) &&
              (s.genres ?? []).some((g) => curGenres.includes(g.toLowerCase()))
          )
          .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
          .slice(0, 6);
        setSimilar(filtered);
      } catch {
        setSimilar([]);
      }
    })();
  }, [anime, id]);

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleAddToWatchlist = async (status = "plan-to-watch") => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    setBusy(true);
    try {
      const res = await addToWatchlist(anime._id, status);
      setWatchItem({
        id: res.id,
        status: normalizeStatus(res.status ?? status),
        show: res.show ?? anime,
      });
      flash("success", "Added to your watchlist");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: location }, replace: true });
      }
      flash("error", "Could not add to watchlist");
    } finally {
      setBusy(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!watchItem) return;
    setBusy(true);
    const prev = watchItem;
    setWatchItem((w) => ({ ...w, status: newStatus }));
    try {
      await updateWatchlistItem(watchItem.id, { status: newStatus });
      flash("success", "Watch status updated");
    } catch (err) {
      setWatchItem(prev);
      flash("error", "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!watchItem) return;
    if (!confirm("Remove this show from your watchlist?")) return;
    setBusy(true);
    const prev = watchItem;
    setWatchItem(null);
    try {
      await removeFromWatchlist(prev.id);
      flash("success", "Removed from watchlist");
    } catch (err) {
      setWatchItem(prev);
      flash("error", "Could not remove item");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-slate-600 dark:text-slate-400">Loading...</div>
    );
  }

  if (!anime) {
    return (
      <div className="p-10 text-slate-600 dark:text-slate-400">
        Anime not found.
      </div>
    );
  }

  return (
    <div className="w-full">
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Banner */}
      <div className="relative w-full h-[50vh] bg-slate-900">
        <img
          src={anime.poster}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex items-center h-full px-8 md:px-16">
          <div className="flex items-start gap-6">
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-40 md:w-56 rounded-lg shadow-lg"
            />

            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold">{anime.title}</h1>
              <p className="mt-2 text-slate-200">
                {anime.releaseYear} • {anime.totalEpisodes} Episodes
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {anime.genres?.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Watchlist controls */}
              <div className="mt-6 flex items-center gap-3">
                {!watchItem ? (
                  <>
                    <select
                      defaultValue="plan-to-watch"
                      className="px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-sm"
                      onChange={(e) => (e.target._chosen = e.target.value)}
                    >
                      <option value="plan-to-watch">Plan to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On-Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                    <button
                      className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg transition"
                      onClick={(e) => {
                        const select =
                          e.currentTarget.parentElement.querySelector("select");
                        const chosen = select._chosen || select.value;
                        handleAddToWatchlist(chosen);
                      }}
                      disabled={busy}
                    >
                      {busy ? "Adding..." : "+ Add to Watchlist"}
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={watchItem.status}
                      onChange={(e) => handleChangeStatus(e.target.value)}
                      disabled={busy}
                      className="px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-sm"
                    >
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="plan-to-watch">Plan to Watch</option>
                      <option value="on-hold">On-Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                    <button
                      onClick={handleRemove}
                      className="px-3 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                      disabled={busy}
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => navigate("/watchlist")}
                      className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700"
                    >
                      View Watchlist
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="px-8 md:px-16 py-12">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Synopsis
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
          {anime.synopsis}
        </p>
      </div>

      {/* Similar shows */}
      {similar?.length > 0 && (
        <div className="px-8 md:px-16 pb-12">
          <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
            You might like
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {similar.map((s) => (
              <div
                key={s._id}
                className="min-w-[160px] rounded-lg overflow-hidden cursor-pointer shrink-0"
                onClick={() => navigate(`/animes/${s._id}`)}
              >
                <img
                  src={s.poster}
                  alt={s.title}
                  className="w-full h-36 object-cover rounded-md"
                />
                <div className="mt-2 text-sm text-black dark:text-white">
                  {s.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
