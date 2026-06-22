import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function attachSecurityHeaders(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");
  return res;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken =
    req.cookies.get("__Secure-better-auth.session_token")?.value ??
    req.cookies.get("better-auth.session_token")?.value;

  const isProtected =
    pathname === "/vault" ||
    pathname === "/bonds" ||
    pathname === "/check" ||
    pathname === "/settings" ||
    pathname === "/admin" ||
    pathname === "/plans" ||
    pathname === "/payments" ||
    pathname.startsWith("/bonds/") ||
    pathname.startsWith("/check/") ||
    pathname.startsWith("/settings/") ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/plans/");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && sessionToken) {
    return attachSecurityHeaders(NextResponse.redirect(new URL("/vault", req.url)));
  }

  if (pathname === "/" && sessionToken) {
    return attachSecurityHeaders(NextResponse.redirect(new URL("/vault", req.url)));
  }

  if (isProtected && !sessionToken) {
    return attachSecurityHeaders(NextResponse.redirect(new URL("/login", req.url)));
  }

  return attachSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)",
  ],
};
