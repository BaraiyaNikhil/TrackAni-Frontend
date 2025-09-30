import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WATCH_STATUS = [
  { label: "Watching", value: "watching" },
  { label: "Completed", value: "completed" },
  { label: "Plan to Watch", value: "plan-to-watch" },
  { label: "On-Hold", value: "on-hold" },
  { label: "Dropped", value: "dropped" },
];

export default function WatchlistItem({
  item,
  onUpdateStatus,
  onUpdateEpisodes,
  onRemove,
  busy,
}) {
  // item shape: { id, status, episodesWatched, show: { title, poster, _id, totalEpisodes, ... } }
  const [updating, setUpdating] = useState(false);
  const [localEpisodes, setLocalEpisodes] = useState(item.episodesWatched ?? 0);
  const navigate = useNavigate();

  useEffect(
    () => setLocalEpisodes(item.episodesWatched ?? 0),
    [item.episodesWatched]
  );

  if (!item?.show) return null;

  const show = item.show;
  const showId = show._id?.$oid ?? show._id ?? show.id ?? show;

  const total = Number(show.totalEpisodes ?? show.totalEpisodes ?? NaN);
  const hasTotal = Number.isFinite(total) && total > 0;
  const percent = hasTotal
    ? Math.min(100, Math.round((localEpisodes / total) * 100))
    : 0;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await onUpdateStatus(item.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetEpisodes = async (value) => {
    const newVal = Math.max(0, Math.floor(Number(value) || 0));
    setLocalEpisodes(newVal);
    setUpdating(true);
    try {
      await onUpdateEpisodes(item.id, newVal);
    } finally {
      setUpdating(false);
    }
  };

  const changeEpisodesBy = async (delta) => {
    const newVal = Math.max(0, (Number(localEpisodes) || 0) + delta);
    // if total known, clamp
    const clamped = hasTotal ? Math.min(newVal, total) : newVal;
    setLocalEpisodes(clamped);
    setUpdating(true);
    try {
      await onUpdateEpisodes(item.id, clamped);
    } finally {
      setUpdating(false);
    }
  };

  const onInputBlur = (e) => {
    // ensure numeric and update server
    const v = e.target.value;
    handleSetEpisodes(v);
  };

  const onInputKey = (e) => {
    if (e.key === "Enter") {
      handleSetEpisodes(e.target.value);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <img
        src={show.poster}
        alt={show.title}
        className="w-20 h-28 object-cover rounded-md cursor-pointer"
        onClick={() => navigate(`/animes/${showId}`)}
      />

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {show.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              {show.synopsis}
            </p>

            {/* progress area */}
            <div className="mt-3">
              {hasTotal ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {localEpisodes} / {total} eps
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {percent}%
                    </div>
                    {item.status === "completed" && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-600 text-white text-xs">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full ${
                          percent > 0 ? "bg-indigo-500" : "bg-transparent"
                        }`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Episodes watched: {localEpisodes}
                </div>
              )}
            </div>

            {/* controls */}
            <div className="flex items-center gap-2 mt-3">
              {/* episode controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeEpisodesBy(-1)}
                  disabled={updating || busy}
                  className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-sm"
                  aria-label="decrement episode"
                >
                  −
                </button>

                <input
                  type="number"
                  value={localEpisodes}
                  onChange={(e) =>
                    setLocalEpisodes(Math.max(0, Number(e.target.value || 0)))
                  }
                  onBlur={onInputBlur}
                  onKeyDown={onInputKey}
                  min={0}
                  max={hasTotal ? total : undefined}
                  className="w-20 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm"
                  aria-label="episodes watched"
                />

                <button
                  onClick={() => changeEpisodesBy(1)}
                  disabled={updating || busy}
                  className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-sm"
                  aria-label="increment episode"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    handleSetEpisodes(hasTotal ? total : localEpisodes)
                  }
                  disabled={updating || busy}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm"
                >
                  Save
                </button>
              </div>

              {/* status select */}
              <select
                value={item.status}
                onChange={handleStatusChange}
                disabled={updating || busy}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm"
              >
                {WATCH_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onRemove(item.id)}
                disabled={updating || busy}
                className="px-3 py-1 rounded-md text-sm border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
              >
                Remove
              </button>

              <button
                onClick={() => navigate(`/animes/${showId}`)}
                className="px-3 py-1 rounded-md text-sm border border-slate-300 dark:border-slate-700"
              >
                View
              </button>
            </div>
          </div>

          {/* right column with meta */}
          <div className="w-24 text-right text-xs text-slate-500 dark:text-slate-400">
            <div>{show.releaseYear}</div>
            <div className="mt-2">{show.totalEpisodes ?? ""} eps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
