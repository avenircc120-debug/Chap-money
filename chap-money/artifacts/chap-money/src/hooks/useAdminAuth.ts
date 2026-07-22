import { useState, useCallback } from "react";

const TOKEN_KEY = "chap_admin_token";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const isAuthenticated = Boolean(token);

  const login = useCallback(async (password: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Erreur réseau" }));
      throw new Error(error ?? "Mot de passe incorrect");
    }
    const { token: t } = await res.json();
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const authFetch = useCallback(
    (url: string, init: RequestInit = {}) =>
      fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      }),
    [token]
  );

  return { isAuthenticated, token, login, logout, authFetch };
}