import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, SESSION_COOKIE } from "@/lib/auth-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const expected = getSessionToken();
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session || session !== expected) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname === "/admin/login") {
    if (session === expected) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
