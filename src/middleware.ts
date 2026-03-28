import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN_KEY, isJwtExpired } from "@/lib/auth-storage";

const LOGIN_PATH = "/login";

function isPublicPath(pathname: string): boolean {
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  if (isPublicPath(pathname)) {
    if (token && !isJwtExpired(decodeURIComponent(token))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token || isJwtExpired(decodeURIComponent(token))) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
