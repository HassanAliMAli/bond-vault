import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;

  const isProtected =
    pathname === "/vault" ||
    pathname === "/bonds" ||
    pathname === "/check" ||
    pathname === "/settings" ||
    pathname.startsWith("/bonds/") ||
    pathname.startsWith("/check/") ||
    pathname.startsWith("/settings/");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/vault", req.url));
  }

  if (pathname === "/" && sessionToken) {
    return NextResponse.redirect(new URL("/vault", req.url));
  }

  if (isProtected && !sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)",
  ],
};
