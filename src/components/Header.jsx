import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears storage + context
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full flex items-center justify-between p-3 dark:bg-slate-800 bg-slate-100">
      <h1
        onClick={() => navigate("/")}
        className="font-semibold text-3xl dark:text-white text-black cursor-pointer"
      >
        TrackAni
      </h1>

      <nav className="flex items-center gap-6 text-lg">
        <Link to="/" className="dark:text-white text-black">Home</Link>
        <Link to="/animes" className="dark:text-white text-black">Animes</Link>
        <Link to="/clubs" className="dark:text-white text-black">Clubs</Link>
        <Link to="/about" className="dark:text-white text-black">AboutUs</Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400">Login</Link>
            <Link to="/register" className="px-3 py-1 rounded-md bg-indigo-600 text-white">Register</Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/watchlist" className="dark:text-white text-black">My Watchlist</Link>

            {/* Profile Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                {user?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm dark:text-white text-black">
                {user?.username ?? user?.email}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md border border-slate-800 dark:border-slate-100 text-sm text-black dark:text-white"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
