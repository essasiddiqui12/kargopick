export const SESSION_COOKIE = "kargopick-admin-session";

export function getSessionToken(): string {
  return (
    process.env.ADMIN_SESSION_TOKEN ||
    process.env.ADMIN_SECRET ||
    "kargopick-dev-secret"
  ).trim();
}
