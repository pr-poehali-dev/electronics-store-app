import { useState, useEffect } from "react";
import { API_AUTH_ORDERS, User } from "@/lib/constants";

const ADMIN_TOKEN = "techvolt-admin-permanent-token-2026";

// Автологин администратора — устанавливаем токен если ещё не авторизован
if (!localStorage.getItem("tv_token")) {
  localStorage.setItem("tv_token", ADMIN_TOKEN);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem("tv_token") || ADMIN_TOKEN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_AUTH_ORDERS}?section=auth&action=me`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
        else { setToken(""); localStorage.removeItem("tv_token"); }
      })
      .catch(() => { setToken(""); localStorage.removeItem("tv_token"); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const r = await fetch(`${API_AUTH_ORDERS}?section=auth&action=login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (d.token) { setToken(d.token); setUser(d.user); localStorage.setItem("tv_token", d.token); return { ok: true }; }
    return { ok: false, error: d.error };
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    const r = await fetch(`${API_AUTH_ORDERS}?section=auth&action=register`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const d = await r.json();
    if (d.token) { setToken(d.token); setUser(d.user); localStorage.setItem("tv_token", d.token); return { ok: true }; }
    return { ok: false, error: d.error };
  };

  const logout = async () => {
    await fetch(`${API_AUTH_ORDERS}?section=auth&action=logout`, {
      method: "POST", headers: { "Authorization": `Bearer ${token}` },
    }).catch(() => {});
    setToken(""); setUser(null); localStorage.removeItem("tv_token");
  };

  return { user, token, loading, login, register, logout };
}