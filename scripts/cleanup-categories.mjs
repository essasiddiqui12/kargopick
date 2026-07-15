import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const oldIds = ["whey-protein", "creatine", "pre-workout", "mass-gainer", "accessories"];

  for (const id of oldIds) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error(`Failed to delete ${id}:`, error.message);
    } else {
      console.log(`Deleted: ${id}`);
    }
  }

  console.log("Cleanup done!");
}

run().catch(console.error);
