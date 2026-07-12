import { readFileSync } from "node:fs";

const expected = {
  NEXT_PUBLIC_SUPABASE_URL: "https://vrbrqekrvprirlzcojpe.supabase.co",
  NEXT_PUBLIC_SITE_URL: "https://kargopick.vercel.app",
  ADMIN_PASSWORD: "admin123",
  NEXT_PUBLIC_WHATSAPP_NUMBER: null,
  ADMIN_SECRET: null,
  ADMIN_LOW_STOCK_THRESHOLD: null,
  SUPABASE_SERVICE_ROLE_KEY: null,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: null,
};

const content = readFileSync(".env.verify-final", "utf8");
const lines = content.split(/\r?\n/);

for (const name of Object.keys(expected)) {
  const line = lines.find((l) => l.startsWith(name + "="));
  if (!line) {
    console.log(name, "MISSING");
    continue;
  }
  let value = line.slice(name.length + 1);
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  const hasLiteralEscape = /\\[rn]/.test(value);
  const exp = expected[name];
  let verdict;
  if (hasLiteralEscape) {
    verdict = "CORRUPTED (literal escape found): " + JSON.stringify(value);
  } else if (exp !== null && value !== exp) {
    verdict = "MISMATCH: got " + JSON.stringify(value) + " expected " + JSON.stringify(exp);
  } else {
    verdict = "OK (len=" + value.length + ")";
  }
  console.log(name.padEnd(30), verdict);
}
