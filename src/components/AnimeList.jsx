// src/components/AnimeList.jsx
import { useEffect, useState } from "react";
import api from "../api/api";
import AnimeCard from "./AnimeCard";

export default function AnimeList({ title, filter }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let endpoint = "/shows"; // default endpoint

    // 🔹 you can extend this when backend supports sorting
    if (filter === "popular") endpoint = "/shows?sort=popular";
    if (filter === "new") endpoint = "/shows?sort=new";

    api
      .get(endpoint)
      .then((res) => setShows(res.data))
      .catch((err) => console.error("Error fetching shows:", err))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <p className="text-slate-600 dark:text-slate-400">Loading {title}...</p>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-black dark:text-white tracking-tight">
        {title}
      </h2>
      {shows.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No shows found.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {shows.map((show) => (
            <AnimeCard key={show._id} anime={show} />
          ))}
        </div>
      )}
    </section>
  );
}
