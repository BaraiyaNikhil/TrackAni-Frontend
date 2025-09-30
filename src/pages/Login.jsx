import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login({ email, password }, remember);
    setBusy(false);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error?.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
          Sign in
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Sign in with your email and password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-black dark:text-white">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <button
            disabled={busy}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm mt-4 text-slate-600 dark:text-slate-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
