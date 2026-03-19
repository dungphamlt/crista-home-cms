"use client";

import { createContext, useContext, useState, useEffect } from "react";

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
    setTokenState(localStorage.getItem("admin_token"));
  }, []);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("admin_token", t);
    else localStorage.removeItem("admin_token");
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
