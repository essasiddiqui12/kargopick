import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
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

  if (!password || !(await verifyPassword(password))) {
    return NextResponse.json(
      { error: "Invalid password", remaining: rateLimit.remaining },
      { status: 401 }
    );
  }

  const sessionId = await createSession();

  const response = NextResponse.json({ success: true });
  response.cookies.set("kargopick-admin-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
