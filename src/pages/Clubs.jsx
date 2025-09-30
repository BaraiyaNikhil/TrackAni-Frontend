// src/pages/Clubs.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listClubs, createClub, joinClub } from "../services/clubsService";
import ClubCard from "../components/ClubCard";

export default function Clubs() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [busyJoin, setBusyJoin] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listClubs();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed loading clubs:", err);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = clubs
    .filter((c) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(s) ||
        (c.description || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (sort === "new") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      const ma = Array.isArray(a.members) ? a.members.length : 0;
      const mb = Array.isArray(b.members) ? b.members.length : 0;
      return mb - ma;
    });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/clubs" } } });
      return;
    }
    setCreating(true);
    try {
      const res = await createClub({
        name: createName.trim(),
        description: createDesc.trim(),
      });
      navigate(`/clubs/${res._id || res.id}`);
    } catch (err) {
      console.error("Create failed:", err);
      alert("Could not create club. Check console.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (clubId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/clubs/${clubId}` } } });
      return;
    }
    setBusyJoin(clubId);
    try {
      const updatedClub = await joinClub(clubId);
      // refresh this club in state
      setClubs((cur) =>
        cur.map((c) =>
          String(c._id) === String(clubId) ? updatedClub : c
        )
      );
    } catch (err) {
      console.error("Join failed:", err);
      alert("Could not join. Try again.");
    } finally {
      setBusyJoin(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Clubs</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <input
            placeholder="Search clubs..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-black dark:text-white"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-md border bg-white dark:bg-slate-800 text-sm text-black dark:text-white"
          >
            <option value="popular">Popular</option>
            <option value="new">Newest</option>
          </select>

          <button
            onClick={() =>
              document
                .getElementById("create-club-form")
                .classList.toggle("hidden")
            }
            className={`px-4 py-2 rounded-xl ${
              isAuthenticated
                ? "bg-indigo-600 text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Login to create a club" : ""}
          >
            Create Club
          </button>
        </div>
      </div>

      {/* create club form */}
      <form
        id="create-club-form"
        onSubmit={handleCreate}
        className="hidden mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <input
            required
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Club name"
            className="w-full md:w-1/3 px-3 py-2 rounded-md border bg-white dark:bg-slate-900 text-black dark:text-white"
          />
          <textarea
            value={createDesc}
            onChange={(e) => setCreateDesc(e.target.value)}
            placeholder="Short description (optional)"
            className="w-full md:flex-1 px-3 py-2 rounded-md border bg-white dark:bg-slate-900 text-black dark:text-white"
          />
        </div>
        <div className="mt-3 flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              setCreateName("");
              setCreateDesc("");
              document
                .getElementById("create-club-form")
                .classList.add("hidden");
            }}
            className="px-3 py-2 rounded-md border  text-black dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-slate-600 dark:text-slate-400">
          Loading clubs...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          No clubs found — create one!
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => {
            const myId = user?.id || user?._id;
            const joined =
              Array.isArray(c.members) &&
              c.members.some((m) => {
                const memberId = typeof m === "object" ? (m._id || m.id) : m;
                return String(memberId) === String(myId);
              });

            return (
              <ClubCard
                key={c._id || c.id}
                club={c}
                onJoin={handleJoin}
                joined={joined}
                loadingJoin={busyJoin === (c._id || c.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
