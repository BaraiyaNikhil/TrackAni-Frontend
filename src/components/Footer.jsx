export default function Footer() {
  const ACCENT_PALETTE = [
    { name: "Indigo", hex: "#6366F1" },
    { name: "Teal", hex: "#14B8A6" },
    { name: "Amber", hex: "#F59E0B" },
    { name: "Rose", hex: "#F43F5E" },
  ];

  return (
    <footer className="bg-slate-100 dark:bg-slate-800 text-black dark:text-white border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center font-bold text-sm bg-indigo-500 dark:bg-indigo-600 text-white">
              T
            </div>
            <div>
              <h4 className="text-lg font-semibold">TrackAni</h4>
              <p className="text-sm mt-0.5 text-black/70 dark:text-white/80">
                Anime & TV Series Tracker
              </p>
            </div>
          </div>

          {/* Social / copyright */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex gap-3">
              <a
                aria-label="linkedin"
                href="https://linkedin.com/in/baraiyanikhil"
                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96v5.7h-3v-10h2.88v1.37h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.58z" />
                </svg>
              </a>
              <a
                aria-label="github"
                href="https://github.com/BaraiyaNikhil/"
                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                target="_blank"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.1c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.46-1.33-5.46-5.9 0-1.3.47-2.36 1.24-3.19-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.88.12 3.18.77.83 1.24 1.89 1.24 3.19 0 4.58-2.8 5.6-5.47 5.89.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.82.57A12 12 0 0012 .5z" />
                </svg>
              </a>
            </div>

            <p className="text-xs mt-3 text-black/70 dark:text-white/80">
              © {new Date().getFullYear()} TrackAni. All rights reserved.
            </p>
          </div>
        </div>

        {/* Accent palette preview*/}
        <div className="mt-8 flex items-center justify-center gap-3">
          {ACCENT_PALETTE.map((c) => (
            <div key={c.hex} className="flex items-center gap-2">
              <span
                role="img"
                aria-label={`${c.name} swatch`}
                title={`${c.name} — ${c.hex}`}
                className="h-6 w-6 rounded-full ring-1 ring-black/10"
                style={{ background: c.hex }}
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
