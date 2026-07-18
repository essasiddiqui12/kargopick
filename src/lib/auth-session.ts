import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export const SESSION_COOKIE = "kargopick-admin-session";

function generateSessionId(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createSession(): Promise<string> {
  const supabase = createAdminClient();
  const id = generateSessionId();

  const { error } = await supabase
    .from("admin_sessions")
    .insert({ id, created_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  return id;
}

export async function getSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || "";
}

export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
  return password.trim() === adminPassword;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("id", token)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;

  const supabase = createAdminClient();
  await supabase
    .from("admin_sessions")
    .delete()
    .eq("id", token);
}
