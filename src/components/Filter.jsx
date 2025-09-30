import React, { useEffect, useState } from "react";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Thriller",
];

const WATCH_STATUS = [
  { label: "Watching", value: "watching" },
  { label: "Completed", value: "completed" },
  { label: "Plan to Watch", value: "plan-to-watch" },
  { label: "On-Hold", value: "on-hold" },
  { label: "Dropped", value: "dropped" },
];

export default function Filter({
  onFilterChange = () => {},
  initialGenres = [],
  initialStatus = "",
}) {
  const [selectedGenres, setSelectedGenres] = useState(initialGenres);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  // Notify parent whenever filters change (fixes race conditions)
  useEffect(() => {
    onFilterChange({
      genres: selectedGenres,
      status: selectedStatus,
    });
  }, [selectedGenres, selectedStatus, onFilterChange]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleStatusChange = (status) => {
    setSelectedStatus((prev) => (prev === status ? "" : status));
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedStatus("");
  };

  return (
    <aside className="w-full">
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            type="button"
          >
            Reset
          </button>
        </div>

        {/* Watch Status */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
            Watch Status
          </h4>
          <ul className="space-y-2">
            {WATCH_STATUS.map((status) => (
              <li key={status.value}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="watchStatus"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={() => handleStatusChange(status.value)}
                    className="text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {status.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Genres */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Genres
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedGenres.length} selected
            </span>
          </div>

          <ul className="space-y-2 overflow-y-auto pr-1">
            {GENRES.map((genre) => (
              <li key={genre}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={genre}
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {genre}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
