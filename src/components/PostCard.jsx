import React, { useEffect, useState } from "react";

/* helper to get id from multiple shapes */
function getId(x) {
  if (!x) return null;
  if (typeof x === "string") return x;
  // if it is a mongoose object, it may have _id or id
  if (typeof x === "object") {
    if (x._id) return String(x._id);
    if (x.id) return String(x.id);
    if (x._id?.$oid) return String(x._id.$oid);
  }
  return null;
}

export default function PostCard({
  post,
  members = [],
  meId,
  clubId,
  onComment,
  onDeletePost,
  onDeleteComment,
}) {

  const postId = getId(post) || post._id || post.id;

  const [showSpoiler, setShowSpoiler] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSpoiler, setCommentSpoiler] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {}, []);

  // normalize me id
  const myId = getId(meId) || meId;

  // initialize local comments (clone) and ensure each has an _id fallback for keys
  const [localComments, setLocalComments] = useState(() =>
    (post.comments || []).map((cm, idx) => {
      const cid = getId(cm) || cm._id || cm.id || `local-${idx}-${Date.now()}`;
      return { ...cm, _id: cid };
    })
  );

  // post author id and name
  const postAuthorId = getId(post.author) || post.author;
  const postAuthorName =
    (post.author && (post.author.username || post.author.name)) ||
    (postAuthorId ? String(postAuthorId).slice(0, 6) : "Unknown");
  const meIsAuthor = Boolean(myId) && String(myId) === String(postAuthorId);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    const content = (commentText || "").trim();
    if (!content) return;
    if (typeof onComment !== "function") {
      alert("Comment handler missing.");
      return;
    }

    setPosting(true);
    try {
      const created = await onComment(clubId, postId, {
        content,
        spoiler: !!commentSpoiler,
      });

      // server should return saved comment. Normalize it and provide
      // sensible optimistic fallbacks so the UI updates immediately.
      let createdComment = created || { content };

      // if server returned a bare id or string, wrap it
      if (typeof createdComment === "string") {
        createdComment = { _id: createdComment, content };
      }

      // ensure content exists (when server returned minimal data)
      if (!createdComment.content && content) {
        createdComment.content = content;
      }

      // ensure a createdAt timestamp for display
      if (!createdComment.createdAt) {
        createdComment.createdAt = new Date().toISOString();
      }

      // make sure it has an id (fallback to local id)
      const cid =
        getId(createdComment) || createdComment._id || createdComment.id;
      if (!cid) {
        createdComment._id = `local-${Date.now()}`;
      }

      // ensure author present so delete button logic works immediately
      if (!createdComment.author) {
        createdComment.author =
          typeof meId === "object" && meId?.username
            ? { _id: myId, username: meId.username }
            : { _id: myId, username: "You" };
      } else if (typeof createdComment.author === "string") {
        createdComment.author = { _id: createdComment.author };
      }

      setLocalComments((c) => [...c, createdComment]);
      setCommentText("");
      setCommentSpoiler(false);
    } catch (err) {
      console.error("Create comment failed:", err);
      alert("Could not post comment. See console.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    const commentId = getId(comment) || comment._id || comment.id;
    if (!commentId) {
      alert(
        "Comment id missing — cannot delete (backend should return saved comment id)."
      );
      return;
    }
    if (!confirm("Delete this comment?")) return;
    setDeletingCommentId(commentId);
    try {
      if (typeof onDeleteComment === "function") {
        await onDeleteComment(clubId, postId, commentId);
      } else {
        throw new Error("onDeleteComment not provided");
      }
      // remove locally
      setLocalComments((c) =>
        c.filter(
          (cm) => String(getId(cm) || cm._id || cm.id) !== String(commentId)
        )
      );
    } catch (err) {
      console.error("Delete comment failed:", err);
      alert("Could not delete comment. See console.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-black dark:text-white">
            {post.title}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {postAuthorName} •{" "}
            {new Date(post.createdAt || Date.now()).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meIsAuthor && (
            <button
              onClick={() => {
                if (typeof onDeletePost === "function")
                  onDeletePost(clubId, postId);
              }}
              className="px-2 py-1 text-sm rounded-md border border-red-500 text-red-600"
            >
              Delete Post
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-slate-700 dark:text-slate-300">
        {post.spoiler ? (
          <>
            {!showSpoiler ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                <div className="text-sm">This post contains spoilers.</div>
                <button
                  onClick={() => setShowSpoiler(true)}
                  className="mt-2 px-3 py-1 rounded-md bg-indigo-600 text-white text-sm"
                >
                  Show Spoiler
                </button>
              </div>
            ) : (
              <div className="whitespace-pre-line">{post.body}</div>
            )}
          </>
        ) : (
          <div className="whitespace-pre-line">{post.body}</div>
        )}
      </div>

      {/* comments */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-black dark:text-white mb-2">
          Comments ({localComments?.length ?? 0})
        </div>

        {(localComments || []).length === 0 ? (
          <div className="text-slate-600 dark:text-slate-400 p-3 rounded-md bg-slate-50 dark:bg-slate-900">
            No comments yet. Be the first to comment.
          </div>
        ) : (
          <div className="space-y-3">
            {(localComments || []).map((cm, idx) => {
              const cid = getId(cm) || cm._id || cm.id || `local-${idx}`;
              const authorId =
                typeof cm.author === "object" ? getId(cm.author) : cm.author;
              const displayName =
                (cm.author && (cm.author.username || cm.author.name)) ||
                (authorId ? String(authorId).slice(0, 6) : "User");
              const canDelete =
                Boolean(authorId) && String(authorId) === String(myId);
              return (
                <div
                  key={cid}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      <div className="font-medium text-black dark:text-white">
                        {displayName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(cm.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    {canDelete && (
                      <div>
                        <button
                          onClick={() => handleDeleteComment(cm)}
                          disabled={deletingCommentId === cid}
                          className="px-2 py-1 text-sm rounded-md border border-red-500 text-red-600"
                        >
                          {deletingCommentId === cid ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-slate-700 dark:text-slate-300">
                    {cm.spoiler ? (
                      <SpoilerText text={cm.content ?? cm.body ?? ""} />
                    ) : (
                      <div className="whitespace-pre-line">
                        {cm.content ?? cm.body ?? ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* comment form */}
      <form
        onSubmit={handleCreateComment}
        className="mt-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-700"
      >
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white border"
        />
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={commentSpoiler}
              onChange={(e) => setCommentSpoiler(e.target.checked)}
            />
            Mark as spoiler
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCommentText("");
                setCommentSpoiler(false);
              }}
              className="px-3 py-1 rounded-md border text-black dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={posting}
              className="px-4 py-1 rounded-xl bg-indigo-600 text-white"
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SpoilerText({ text = "" }) {
  const [visible, setVisible] = useState(false);
  return visible ? (
    <div>{text}</div>
  ) : (
    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded">
      <div className="text-sm text-slate-500">Spoiler hidden</div>
      <button
        onClick={() => setVisible(true)}
        className="mt-2 px-3 py-1 rounded-md bg-indigo-600 text-white text-sm"
      >
        Show
      </button>
    </div>
  );
}
