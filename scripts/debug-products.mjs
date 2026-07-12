import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.debug", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx), l.slice(idx + 1).replace(/^"|"$/g, "")];
    })
);

console.log("URL:", env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Service key len:", env.SUPABASE_SERVICE_ROLE_KEY?.length);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
console.log("error:", error);
console.log("data:", JSON.stringify(data, null, 2));
