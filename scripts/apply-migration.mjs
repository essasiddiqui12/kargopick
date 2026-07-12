/**
 * Apply a Supabase SQL migration file via Management API.
 * Usage: node scripts/apply-migration.mjs supabase/migrations/20260712160000_product_storage.sql
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PROJECT_REF = "vrbrqekrvprirlzcojpe";
const migrationArg = process.argv[2];

if (!migrationArg) {
  console.error("Usage: node scripts/apply-migration.mjs <migration-file>");
  process.exit(1);
}

const MIGRATION_FILE = path.resolve(migrationArg);

function getAccessToken() {
  const ps = `
Add-Type -Namespace Win32 -Name CredMan -MemberDefinition @"
[DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
public static extern bool CredRead(string target, int type, int reserved, out IntPtr credential);
[DllImport("advapi32.dll", SetLastError=true)]
public static extern bool CredFree(IntPtr credential);
[StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
public struct CREDENTIAL {
  public int Flags;
  public int Type;
  public IntPtr TargetName;
  public IntPtr Comment;
  public long LastWritten;
  public int CredentialBlobSize;
  public IntPtr CredentialBlob;
  public int Persist;
  public int AttributeCount;
  public IntPtr Attributes;
  public IntPtr TargetAlias;
  public IntPtr UserName;
}
"@
$credPtr = [IntPtr]::Zero
if (-not [Win32.CredMan]::CredRead("Supabase CLI:supabase", 1, 0, [ref]$credPtr)) { exit 1 }
$cred = [System.Runtime.InteropServices.Marshal]::PtrToStructure($credPtr, [type][Win32.CredMan+CREDENTIAL])
$size = $cred.CredentialBlobSize
$bytes = New-Object byte[] $size
[System.Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $bytes, 0, $size)
[Win32.CredMan]::CredFree($credPtr) | Out-Null
[Text.Encoding]::UTF8.GetString($bytes)
`;

  const token = execFileSync("powershell", ["-NoProfile", "-Command", ps], {
    encoding: "utf8",
  }).trim();

  if (!token) throw new Error("Could not read Supabase CLI token");
  return token;
}

async function runQuery(token, query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    if (text.includes("already exists")) {
      console.log("  (skipped — already exists)");
      return null;
    }
    throw new Error(`API ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

const sql = readFileSync(MIGRATION_FILE, "utf8")
  .replace(/--.*$/gm, "")
  .trim();

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const token = getAccessToken();
console.log(`Applying ${statements.length} statements from ${path.basename(MIGRATION_FILE)}...`);

for (const statement of statements) {
  const preview = statement.replace(/\s+/g, " ").slice(0, 80);
  console.log(`→ ${preview}...`);
  await runQuery(token, statement);
}

console.log("Migration applied successfully.");
