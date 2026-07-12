import { NextRequest, NextResponse } from "next/server";
import {
  getSessionToken,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!password || !verifyPassword(password)) {
    return NextResponse.json(
      { error: "Invalid password", remaining: rateLimit.remaining },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
