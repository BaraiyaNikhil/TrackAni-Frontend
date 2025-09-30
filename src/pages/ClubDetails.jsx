// src/pages/ClubDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getClub,
  joinClub,
  createPost,
  commentOnPost,
  deletePost,
  deleteComment,
  deleteClub, // ✅ added
} from "../services/clubsService";
import PostCard from "../components/PostCard";

function getId(x) {
  if (!x) return null;
  if (typeof x === "string") return x;
  return x._id ?? x.id ?? (x._id?.$oid ?? null);
}

export default function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // create post form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getClub(id);
      setClub(res);
    } catch (err) {
      console.error("Failed to load club:", err);
      if (err?.response?.status === 404) {
        alert("Club not found");
        navigate("/clubs");
      } else if (err?.response?.status === 401) {
        navigate("/login", { state: { from: location } });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isMember = useMemo(() => {
    if (!club || !club.members) return false;
    const myId = user?.id ?? user?._id;
    return club.members.some((m) => String(getId(m)) === String(myId));
  }, [club, user]);

  // ✅ check if current user is the creator (first member)
  const isOwner = useMemo(() => {
    if (!club || !club.members || !user) return false;
    const myId = user?.id ?? user?._id;
    return String(getId(club.members[0])) === String(myId);
  }, [club, user]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setJoining(true);
    try {
      await joinClub(id);
      await load();
    } catch (err) {
      console.error("Join failed:", err);
      alert("Could not join club (see console).");
    } finally {
      setJoining(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const newPost = await createPost(id, {
        title: title.trim(),
        body: body.trim(),
        spoiler,
      });
      setClub((c) => ({ ...c, posts: [newPost, ...(c.posts || [])] }));
      setTitle("");
      setBody("");
      setSpoiler(false);
    } catch (err) {
      console.error("Create post failed:", err);
      alert("Could not create post. See console.");
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (clubId, postId, payload) => {
    try {
      const comment = await commentOnPost(clubId, postId, payload);
      setClub((c) => {
        const posts = (c.posts || []).map((p) => {
          if (
            String(p._id) === String(postId) ||
            String(p.id) === String(postId)
          ) {
            return { ...p, comments: [...(p.comments || []), comment] };
          }
          return p;
        });
        return { ...c, posts };
      });
    } catch (err) {
      console.error("Comment failed:", err);
      alert("Could not post comment.");
      throw err;
    }
  };

  const handleDeletePost = async (clubId, postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(clubId, postId);
      setClub((c) => ({
        ...c,
        posts: (c.posts || []).filter(
          (p) =>
            String(p._id) !== String(postId) &&
            String(p.id) !== String(postId)
        ),
      }));
    } catch (err) {
      console.error("Delete post failed:", err);
      alert("Could not delete post.");
    }
  };

  const handleDeleteComment = async (clubId, postId, commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(clubId, postId, commentId);
      setClub((c) => {
        const posts = (c.posts || []).map((p) => {
          if (
            String(p._id) === String(postId) ||
            String(p.id) === String(postId)
          ) {
            return {
              ...p,
              comments: (p.comments || []).filter(
                (cm) =>
                  String(cm._id) !== String(commentId) &&
                  String(cm.id) !== String(commentId)
              ),
            };
          }
          return p;
        });
        return { ...c, posts };
      });
    } catch (err) {
      console.error("Delete comment failed:", err);
      alert("Could not delete comment.");
    }
  };

  // ✅ Delete club handler
  const handleDeleteClub = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this club? This action cannot be undone."
      )
    )
      return;
    try {
      await deleteClub(id);
      alert("Club deleted successfully.");
      navigate("/clubs");
    } catch (err) {
      console.error("Delete club failed:", err);
      alert("Could not delete club.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-600 dark:text-slate-400">
        Loading club...
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-8 text-slate-600 dark:text-slate-400">
        Club not found.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            <p className="mt-2 max-w-2xl">{club.description}</p>
            <div className="mt-3 text-sm opacity-90">
              {club.members?.length ?? 0} members  created {" "}
              {new Date(club.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isMember ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="px-4 py-2 rounded-xl bg-white text-indigo-600"
              >
                {joining ? "Joining..." : "Join Club"}
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-white/20 text-white">
                Member
              </div>
            )}

            {isOwner && (
              <button
                onClick={handleDeleteClub}
                className="px-4 py-2 rounded-xl bg-red-600 text-white"
              >
                Delete Club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* members strip */}
      <div className="mt-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-black dark:text-white">
            Members
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {club.members?.length ?? 0} total
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {club.members?.map((m) => {
            const mid = getId(m);
            const display =
              m.username || m.email || String(mid).slice(0, 6);
            return (
              <div
                key={mid}
                className="flex flex-col items-center text-center min-w-[84px]"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                  {(display || "U")[0]?.toUpperCase()}
                </div>
                <div className="text-xs mt-1 text-slate-700 dark:text-slate-300">
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* create post -> visible to members */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
          Posts
        </h2>

        {!isMember ? (
          <div className="p-4 mb-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            You must join the club to create posts or comment.
          </div>
        ) : (
          <form
            onSubmit={handleCreatePost}
            className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-3 py-2 rounded-md border mb-2 bg-white dark:bg-slate-900 text-black dark:text-white"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write something..."
              className="w-full px-3 py-2 rounded-md border mb-2 bg-white dark:bg-slate-900 text-black dark:text-white"
              rows={4}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-black dark:text-white">
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={(e) => setSpoiler(e.target.checked)}
                />
                <span>Mark as spoiler</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setBody("");
                    setSpoiler(false);
                  }}
                  className="px-3 py-1 rounded-md border text-black dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                >
                  {posting ? "Posting..." : "Create Post"}
                </button>
              </div>
            </div>
          </form>
        )}

        {(club.posts || []).length === 0 ? (
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            No posts yet. Be the first to start a discussion.
          </div>
        ) : (
          <div className="space-y-4">
            {(club.posts || []).map((p) => (
              <PostCard
                key={p._id || p.id || p.createdAt}
                post={p}
                members={club.members || []}
                meId={user?.id ?? user?._id}
                clubId={id}
                onComment={handleComment}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
