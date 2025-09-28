// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * About page — friendly, internship-ready placeholder
 * - Drop-in: src/pages/About.jsx
 * - Uses Tailwind classes, supports dark mode (matches project)
 */

const FEATURES = [
  {
    title: "Track Progress",
    desc: "Log episodes watched, set statuses, and never lose your place.",
    icon: "📺",
  },
  {
    title: "Curated Lists",
    desc: "Popular, new releases, and editor’s picks to help you discover.",
    icon: "🔥",
  },
  {
    title: "Clubs & Discussions",
    desc: "Create and join clubs, post, and comment with other fans.",
    icon: "💬",
  },
  {
    title: "Personal Watchlist",
    desc: "Your shows in one place — manage status, notes, and ratings.",
    icon: "⭐",
  },
];

const TEAM = [
  {
    name: "Aisha Khan",
    role: "Frontend Engineer (Intern)",
    bio: "Builds delightful UI interactions and polished components.",
    color: "bg-indigo-500",
  },
  {
    name: "Ravi Patel",
    role: "Backend Engineer",
    bio: "APIs, auth, and the glue that makes the app talk to the server.",
    color: "bg-emerald-500",
  },
  {
    name: "Maya Chen",
    role: "Product Designer",
    bio: "Designs flow, icons, and lovable micro-interactions.",
    color: "bg-rose-500",
  },
  {
    name: "You (Intern)",
    role: "Fullstack Intern",
    bio: "This is your playground — learn, ship, and grow the product.",
    color: "bg-sky-500",
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 opacity-20 dark:opacity-30 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                About <span className="text-indigo-600 dark:text-indigo-400">TrackAni</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl">
                Built with ❤️ during an internship project. I am obsessed with making tracking and discovering anime delightful, simple, and social.
              </p>

              <div className="flex items-center gap-3">
                <Link
                  to="/animes"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 font-medium shadow"
                >
                  Browse Anime
                </Link>
              </div>

              <div className="mt-6 flex gap-6">
                <div>
                  <div className="text-3xl font-bold">5k+</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Active users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">2k+</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Shows tracked</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">100+</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Clubs & posts</div>
                </div>
              </div>
            </div>

            {/* Illustration card */}
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-400 flex items-center justify-center text-white text-2xl font-bold">
                  TA
                </div>
                <div>
                  <h3 className="text-lg font-semibold">TrackAni</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">A tiny place to track your favorite anime & shows.</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{f.icon}</div>
                      <div>
                        <div className="text-sm font-semibold">{f.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission + Values */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl p-6 bg-white dark:bg-slate-800 shadow">
            <h2 className="text-2xl font-semibold mb-2">Our mission</h2>
            <p className="text-slate-600 dark:text-slate-300">
              To make anime tracking joyful — not a chore. We focus on a clean reading experience, useful social features (clubs & posts), and a watchlist that actually helps you finish shows.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <div className="text-sm font-semibold">Simplicity</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Easy to use, easy to understand.</div>
              </div>
              <div className="rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <div className="text-sm font-semibold">Reliability</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Your watchlist is safe & consistent.</div>
              </div>
              <div className="rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <div className="text-sm font-semibold">Community</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Clubs, posts, and healthy discussions.</div>
              </div>
              <div className="rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <div className="text-sm font-semibold">Learning</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Designed for interns — ship small, learn big.</div>
              </div>
            </div>
          </div>

          <aside className="rounded-xl p-6 bg-slate-100 dark:bg-slate-800 shadow">
            <h3 className="text-lg font-semibold mb-3">Quick facts</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Founded:</strong> Internship Project</li>
              <li><strong>Stack:</strong> React, Tailwind, Node, MongoDB</li>
              <li><strong>Auth:</strong> JWT-based</li>
              <li><strong>API base:</strong> <code>VITE_API_BASE_URL</code></li>
            </ul>
            <div className="mt-6">
              <a href="#contact" className="inline-block px-4 py-2 rounded-md bg-indigo-600 text-white">Get in touch</a>
            </div>
          </aside>
        </div>
      </section>

      {/* Roadmap / timeline */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6">Roadmap (what's next)</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600 font-bold">Q1</div>
            <div>
              <div className="font-semibold">Improved recommendations</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Personalized suggestions based on your watch history.</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600 font-bold">Q2</div>
            <div>
              <div className="font-semibold">Mobile-first polish</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Better responsive experiences and accessibility improvements.</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600 font-bold">Q3</div>
            <div>
              <div className="font-semibold">Club features v2</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Rich posts, polls, and moderation tools.</div>
            </div>
          </div>
        </div>
      </section>

      {/* small footer-like bit */}
      <footer className="mt-12 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} TrackAni — Internship Project. Made with ❤️.
      </footer>
    </div>
  );
}
