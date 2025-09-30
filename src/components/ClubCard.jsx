import { useNavigate } from "react-router-dom";

export default function ClubCard({
  club,
  onJoin,
  joined = false,
  loadingJoin = false,
}) {
  const navigate = useNavigate();
  const id = club._id ?? club.id ?? club._id?.$oid ?? null;

  const desc = (club.description || "").slice(0, 160);

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
      <div
        className="h-32 bg-gradient-to-r from-indigo-600/60 to-indigo-400/30 flex items-end p-4 cursor-pointer"
        onClick={() => navigate(`/clubs/${id}`)}
      >
        <h3 className="text-lg font-semibold text-white truncate">
          {club.name}
        </h3>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          {desc}
          {club.description?.length > 160 ? "…" : ""}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {Array.isArray(club.members)
              ? club.members.length
              : club.memberCount ?? 0}{" "}
            members
          </div>

          {onJoin ? (
            <div>
              <button
                onClick={() => !joined && onJoin(id)}
                disabled={loadingJoin || joined}
                className={`px-3 py-1 rounded-md text-sm ${
                  joined
                    ? "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-700 text-black dark:text-white cursor-default"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {loadingJoin ? "Working..." : joined ? "Joined" : "Join"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/clubs/${id}`)}
              className="px-3 py-1 rounded-md text-sm border border-slate-300 dark:border-slate-700"
            >
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
