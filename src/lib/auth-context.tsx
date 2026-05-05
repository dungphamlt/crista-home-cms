"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import {
  AUTH_TOKEN_KEY,
  AUTH_COOKIE_OPTIONS,
  AUTH_ROLE_HINT_KEY,
  getRoleFromToken,
} from "@/lib/auth-storage";

const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string | null) => void;
  isReady: boolean;
  /** Role từ payload JWT (để hiển thị menu; không thay thế kiểm tra quyền phía server). */
  sessionRole: string | null;
  isAdminSession: boolean;
}>({
  token: null,
  setToken: () => {},
  isReady: false,
  sessionRole: null,
  isAdminSession: false,
});

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
    else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      try {
        localStorage.removeItem(AUTH_ROLE_HINT_KEY);
      } catch {
        /* ignore */
      }
    }
    if (t) {
      setCookie(AUTH_TOKEN_KEY, t, AUTH_COOKIE_OPTIONS);
    } else {
      removeCookie(AUTH_TOKEN_KEY, { path: "/" });
    }
    setTokenState(t);
  };

  const sessionRole = token ? getRoleFromToken(token) : null;
  const isAdminSession = sessionRole === "admin";

  return (
    <AuthContext.Provider
      value={{ token, setToken, isReady, sessionRole, isAdminSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
