import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { getSessionToken, SESSION_COOKIE } from "@/lib/auth-session";

export { SESSION_COOKIE, getSessionToken } from "@/lib/auth-session";

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return false;
  return session === getSessionToken();
}
