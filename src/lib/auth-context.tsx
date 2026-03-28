"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { AUTH_TOKEN_KEY, AUTH_COOKIE_OPTIONS } from "@/lib/auth-storage";

const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string | null) => void;
  isReady: boolean;
}>({ token: null, setToken: () => {}, isReady: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setCookie, removeCookie] = useCookies([AUTH_TOKEN_KEY]);
  const [token, setTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    const fromStorage = localStorage.getItem(AUTH_TOKEN_KEY);
    setTokenState(fromStorage);
    if (fromStorage) {
      setCookie(AUTH_TOKEN_KEY, fromStorage, AUTH_COOKIE_OPTIONS);
    }
  }, [setCookie]);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem(AUTH_TOKEN_KEY, t);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
    if (t) {
      setCookie(AUTH_TOKEN_KEY, t, AUTH_COOKIE_OPTIONS);
    } else {
      removeCookie(AUTH_TOKEN_KEY, { path: "/" });
    }
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
