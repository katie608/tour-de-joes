import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, getToken, setToken } from "../api";

export interface TeamInfo {
  id: number;
  name: string;
  unspentPoints: number;
  controlledStores: number;
}

interface AuthState {
  team: TeamInfo | null;
  isAdmin: boolean;
  loading: boolean;
  register: (name: string, password: string, phoneNumber?: string) => Promise<void>;
  login: (name: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setTeam(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    try {
      const me = await apiFetch("/auth/me");
      if (me.admin) {
        setIsAdmin(true);
        setTeam(null);
      } else {
        setIsAdmin(false);
        setTeam(me.team);
      }
    } catch {
      setToken(null);
      setTeam(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const register = useCallback(
    async (name: string, password: string, phoneNumber?: string) => {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, password: password || undefined, phoneNumber: phoneNumber || undefined }),
      });
      setToken(data.token);
      setIsAdmin(false);
      setTeam(data.team);
    },
    []
  );

  const login = useCallback(async (name: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, password: password || undefined }),
    });
    setToken(data.token);
    setIsAdmin(false);
    setTeam(data.team);
  }, []);

  const adminLogin = useCallback(async (username: string, password: string) => {
    const data = await apiFetch("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setIsAdmin(true);
    setTeam(null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTeam(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ team, isAdmin, loading, register, login, adminLogin, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
