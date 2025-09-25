// src/components/Filter.jsx
import { useState } from "react";

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

export default function Filter({ onFilterChange }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // 🔹 Notify parent when filters change
  const notifyChange = () => {
    if (onFilterChange) {
      onFilterChange({
        genres: selectedGenres,
        status: selectedStatus,
      });
    }
  };

  return (
    <aside
      className="w-64 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
                 p-6 min-h-screen"
    >
      <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
        Filters
      </h3>

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
                  onChange={() => {
                    handleStatusChange(status.value);
                    notifyChange();
                  }}
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
        <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Genres
        </h4>
        <ul className="space-y-2 overflow-y-auto pr-1">
          {GENRES.map((genre) => (
            <li key={genre}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => {
                    toggleGenre(genre);
                    notifyChange();
                  }}
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
    </aside>
  );
}
