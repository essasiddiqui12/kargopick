export const SESSION_COOKIE = "kartix-admin-session";

export function getSessionToken(): string {
  return (
    process.env.ADMIN_SESSION_TOKEN ||
    process.env.ADMIN_SECRET ||
    "kartix-dev-secret"
  );
}
