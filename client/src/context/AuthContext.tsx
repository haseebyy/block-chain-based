import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

type Role = "ADMIN" | "OWNER" | "BUYER" | "TRAFFIC_POLICE";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; role: Role }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("blockc_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("blockc_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("blockc_token", data.token);
    localStorage.setItem("blockc_user", JSON.stringify(data.user));
  };

  const register = async (payload: { fullName: string; email: string; password: string; role: Role }) => {
    await api.post("/auth/register", payload);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/logout");
      }
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("blockc_token");
      localStorage.removeItem("blockc_user");
    }
  };

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
