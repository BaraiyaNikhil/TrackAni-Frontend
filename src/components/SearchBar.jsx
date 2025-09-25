// src/components/SearchBar.jsx
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search...", onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md relative"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 
                   bg-slate-100 dark:bg-slate-800 text-black dark:text-white 
                   placeholder-slate-500 dark:placeholder-slate-400 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
      >
        <Search size={18} />
      </button>
    </form>
  );
}
