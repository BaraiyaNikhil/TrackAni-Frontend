// src/pages/AnimeDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/shows/${id}`)
      .then((res) => setAnime(res.data))
      .catch((err) => console.error("Error fetching anime:", err))
      .finally(() => setLoading(false));
  }, [id]);

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
      {/* Banner Section */}
      <div className="relative w-full h-[50vh] bg-slate-900">
        <img
          src={anime.poster}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex items-center h-full px-8 md:px-16">
          <div className="flex items-start gap-6">
            {/* Poster */}
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-40 md:w-56 rounded-lg shadow-lg"
            />
            {/* Info */}
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
              <button className="mt-6 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg transition">
                + Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-8 md:px-16 py-12">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Synopsis
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
          {anime.synopsis}
        </p>
      </div>
    </div>
  );
}
