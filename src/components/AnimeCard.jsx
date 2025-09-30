import { useNavigate } from "react-router-dom";

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

export default function AnimeCard({ anime }) {
  const navigate = useNavigate();
  const id = getIdFromObj(anime._id ?? anime.id ?? anime);

  return (
    <div
      onClick={() => navigate(`/animes/${id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/animes/${id}`);
      }}
      role="button"
      tabIndex={0}
      className="group bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer"
    >
      <div className="relative">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full h-44 sm:h-56 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
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
