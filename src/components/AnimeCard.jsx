// src/components/AnimeCard.jsx
export default function AnimeCard({ anime }) {
  return (
    <div className="group bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer">
      <div className="relative">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-sm font-semibold text-white truncate">
            {anime.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
