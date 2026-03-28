"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AUTH_TOKEN_KEY, setAuthCookie } from "@/lib/auth-storage";

const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string | null) => void;
  isReady: boolean;
}>({ token: null, setToken: () => {}, isReady: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    const fromStorage = localStorage.getItem(AUTH_TOKEN_KEY);
    setTokenState(fromStorage);
    if (fromStorage) setAuthCookie(fromStorage);
  }, []);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem(AUTH_TOKEN_KEY, t);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthCookie(t);
    setTokenState(t);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
