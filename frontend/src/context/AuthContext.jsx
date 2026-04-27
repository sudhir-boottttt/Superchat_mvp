import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "superchat_token";
const USER_KEY = "superchat_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  });
  const [loading, setLoading] = useState(Boolean(token && !user));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await apiFetch("/api/auth/me", { token });
        if (!active) {
          return;
        }

        setUser(response.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      } catch (error) {
        clearAuth();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [token, user]);

  function saveAuth(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  function clearAuth() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        saveAuth,
        clearAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
