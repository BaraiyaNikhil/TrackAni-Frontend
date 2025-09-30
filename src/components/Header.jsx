import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full dark:bg-slate-800 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1
          onClick={() => navigate("/")}
          className="font-semibold text-2xl sm:text-3xl dark:text-white text-black cursor-pointer"
        >
          TrackAni
        </h1>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-lg">
          <Link to="/" className="dark:text-white text-black">
            Home
          </Link>
          <Link to="/animes" className="dark:text-white text-black">
            Animes
          </Link>
          <Link to="/clubs" className="dark:text-white text-black">
            Clubs
          </Link>
          <Link to="/about" className="dark:text-white text-black">
            AboutUs
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 rounded-md bg-indigo-600 text-white"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/watchlist" className="dark:text-white text-black">
                My Watchlist
              </Link>

              {/* Profile Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                  {user?.username?.[0]?.toUpperCase() ??
                    user?.email?.[0]?.toUpperCase()}
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

        {/* mobile toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-slate-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu panel */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-black dark:text-white">
          <Link to="/" onClick={() => setOpen(false)} className="block py-2">
            Home
          </Link>
          <Link
            to="/animes"
            onClick={() => setOpen(false)}
            className="block py-2"
          >
            Animes
          </Link>
          <Link
            to="/clubs"
            onClick={() => setOpen(false)}
            className="block py-2"
          >
            Clubs
          </Link>
          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="block py-2"
          >
            About
          </Link>

          {!isAuthenticated ? (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="py-2 text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="py-2 px-3 rounded-md bg-indigo-600 text-white"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/watchlist"
                onClick={() => setOpen(false)}
                className="block py-2"
              >
                My Watchlist
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full text-left py-2"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-left py-2 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
