import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const categories = [
    {
      id: "gym-essentials",
      name: "Gym Essentials",
      description: "Proteins, creatine, pre-workout & mass gainer",
      icon: "💪",
      sort_order: 0,
      is_active: true,
    },
    {
      id: "imported",
      name: "Imported Products",
      description: "Premium international brands & authentic supplements",
      icon: "🌍",
      sort_order: 1,
      is_active: true,
    },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert(cat, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed ${cat.id}:`, error.message);
    } else {
      console.log(`Seeded: ${cat.name}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);
