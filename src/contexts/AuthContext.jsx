import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginAPI, registerAPI } from "../services/authService";
import api, { setAuthLogoutHandler } from "../api/api";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore token & user from storage on mount
  useEffect(() => {
    const t = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    const u =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    setToken(t);
    setUser(u);
    setLoading(false);

    if (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
  }, []);

  // Keep axios header in sync
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const handleLogin = useCallback(
    async ({ email, password }, remember = false) => {
      setLoading(true);
      try {
        const data = await loginAPI({ email, password });
        const t = data.token;
        const u = data.user;

        if (remember) {
          localStorage.setItem("jwt", t);
          localStorage.setItem("user", JSON.stringify(u));
        } else {
          sessionStorage.setItem("jwt", t);
          sessionStorage.setItem("user", JSON.stringify(u));
        }

        setToken(t);
        setUser(u);
        return { ok: true, user: u };
      } catch (err) {
        console.error("Login failed", err);
        return { ok: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleRegister = useCallback(
    async ({ username, email, password }, remember = true) => {
      setLoading(true);
      try {
        const data = await registerAPI({ username, email, password });
        const t = data.token;
        const u = data.user;

        if (remember) {
          localStorage.setItem("jwt", t);
          localStorage.setItem("user", JSON.stringify(u));
        } else {
          sessionStorage.setItem("jwt", t);
          sessionStorage.setItem("user", JSON.stringify(u));
        }

        setToken(t);
        setUser(u);
        return { ok: true, user: u };
      } catch (err) {
        console.error("Register failed", err);
        return { ok: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setAuthLogoutHandler(logout);
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout,
    isAuthenticated: !!token,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
