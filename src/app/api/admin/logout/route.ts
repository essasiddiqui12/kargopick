import { NextResponse } from "next/server";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
