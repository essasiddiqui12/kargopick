import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const migrationPath = join(process.cwd(), "supabase/migrations/20260716220000_product_variants.sql");
const sql = readFileSync(migrationPath, "utf-8");

async function runMigration() {
  console.log("Running migration: product_variants...");
  
  const { error } = await supabase.rpc("exec_sql", { sql });
  
  if (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
  
  console.log("Migration completed successfully.");
}

runMigration();
