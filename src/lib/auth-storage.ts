/**
 * Token lưu localStorage (axios) + cookie (middleware / SSR).
 * Cookie không httpOnly để client đọc/ghi đồng bộ với AuthProvider.
 * Ghi cookie qua react-cookie / universal-cookie (AuthProvider, clearAuth…).
 */

import Cookies from "universal-cookie";

export const AUTH_TOKEN_KEY = "admin_token";

/** Role từ body login nếu JWT không có claim `role` (tuỳ backend). */
export const AUTH_ROLE_HINT_KEY = "admin_session_role_hint";

/** Dùng chung cho setCookie (react-cookie) và removeCookie */
export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 604800,
  sameSite: "lax" as const,
};

/** Giải mã payload JWT (không verify chữ ký). */
export function getJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Role trong token hoặc hint sau đăng nhập (Nest thường dùng claim `role`). */
export function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  const p = getJwtPayload(token);
  if (p) {
    const r = p.role;
    if (typeof r === "string" && r.trim()) return r.toLowerCase().trim();
  }
  if (typeof window !== "undefined") {
    try {
      const hint = localStorage.getItem(AUTH_ROLE_HINT_KEY);
      if (hint?.trim()) return hint.toLowerCase().trim();
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function isTokenAdminRole(token: string | null): boolean {
  return getRoleFromToken(token) === "admin";
}

/** Kiểm tra JWT hết hạn (chỉ đọc payload.exp, không verify chữ ký). Dùng được trong Edge middleware. */
export function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = getJwtPayload(token) as { exp?: number } | null;
    if (!payload) return true;
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
    localStorage.removeItem(AUTH_ROLE_HINT_KEY);
  } catch {
    /* ignore */
  }
  new Cookies().remove(AUTH_TOKEN_KEY, { path: "/" });
  window.location.href = "/login";
}
