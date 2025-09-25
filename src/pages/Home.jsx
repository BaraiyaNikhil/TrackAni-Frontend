// src/pages/Home.jsx
import AnimeList from "../components/AnimeList";
import HeroImg from "../assets/hero_img.jpg"

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="relative w-full h-[60vh] bg-gradient-to-r from-slate-900 to-slate-800 flex items-center">
        <div className="absolute inset-0">
          <img
            src={HeroImg}
            alt="Hero Anime"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 px-8 md:px-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Discover. Track. Enjoy.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-xl">
            Your ultimate Anime & TV series tracker — powered by KharvoAnimer.
          </p>
          <button className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg transition">
            Explore Now
          </button>
        </div>
      </div>

      {/* Anime Lists */}
      <div className="px-6 md:px-16 py-12 space-y-12">
        <AnimeList title="🔥 Popular Anime" filter="popular" />
        <AnimeList title="🆕 New Releases" filter="new" />
        <AnimeList title="All Shows" filter="all" />
      </div>
    </div>
  );
}
