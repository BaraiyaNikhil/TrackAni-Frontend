import { Link } from "react-router-dom";

export default function Header() {

  const nav_list = ["Home", "Animes", "My Watchlist", "Club's", "AboutUs"];

  return (
    <header className="w-full flex justify-between p-3 dark:bg-slate-800 bg-slate-100">
      <div id="logo">
        <h1 className="font-semibold text-3xl dark:text-white text-black">
          TrackAni
        </h1>
      </div>
      <nav className="w-1/2 flex justify-around text-xl">
              <Link className="dark:text-white text-black" to="/">
                Home
              </Link>
              <Link className="dark:text-white text-black" to="/animes">
                Animes
              </Link>
              <Link className="dark:text-white text-black" to="/watchlist">
                My Watchlist
              </Link>
              <Link className="dark:text-white text-black" to="/clubs">
                Club's
              </Link>
              <Link className="dark:text-white text-black" to="/about">
                AboutUs
              </Link>
      </nav>
    </header>
  );
  
}

