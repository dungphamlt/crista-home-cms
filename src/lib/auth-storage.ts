/**
 * Token lưu localStorage (axios) + cookie (middleware / SSR).
 * Cookie không httpOnly để client đọc/ghi đồng bộ với AuthProvider.
 * Ghi cookie qua react-cookie / universal-cookie (AuthProvider, clearAuth…).
 */

import Cookies from "universal-cookie";

export const AUTH_TOKEN_KEY = "admin_token";

/** Dùng chung cho setCookie (react-cookie) và removeCookie */
export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 604800,
  sameSite: "lax" as const,
};

/** Kiểm tra JWT hết hạn (chỉ đọc payload.exp, không verify chữ ký). Dùng được trong Edge middleware. */
export function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    if (payload.exp == null) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function clearAuthAndRedirectToLogin() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  new Cookies().remove(AUTH_TOKEN_KEY, { path: "/" });
  window.location.href = "/login";
}
