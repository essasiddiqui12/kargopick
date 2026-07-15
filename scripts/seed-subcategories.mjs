import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const subcategories = [
    { id: "whey-protein", name: "Whey Protein", description: "Whey concentrate, isolate & hydrolysate", parent_category: "gym-essentials", icon: "💪", sort_order: 0, is_active: true },
    { id: "creatine", name: "Creatine", description: "Monohydrate & advanced creatine formulas", parent_category: "gym-essentials", icon: "⚡", sort_order: 1, is_active: true },
    { id: "pre-workout", name: "Pre-Workout", description: "Explosive energy, focus & pump formulas", parent_category: "gym-essentials", icon: "🔥", sort_order: 2, is_active: true },
    { id: "mass-gainer", name: "Mass Gainer", description: "High-calorie mass building formulas", parent_category: "gym-essentials", icon: "📈", sort_order: 3, is_active: true },
    { id: "isolate", name: "Isolate", description: "Pure whey protein isolate for lean muscle", parent_category: "gym-essentials", icon: "🧬", sort_order: 4, is_active: true },
    { id: "multi-vitamin", name: "Multi Vitamin", description: "Complete multivitamin stacks for athletes", parent_category: "gym-essentials", icon: "💊", sort_order: 5, is_active: true },
    { id: "omega", name: "Omega", description: "Fish oil & omega fatty acid supplements", parent_category: "gym-essentials", icon: "🐟", sort_order: 6, is_active: true },
    { id: "fish-oil", name: "Fish Oil", description: "Pure fish oil for joint & heart health", parent_category: "gym-essentials", icon: "🫒", sort_order: 7, is_active: true },
    { id: "nitro-plus", name: "Nitro Plus", description: "Advanced nitric oxide boosters", parent_category: "gym-essentials", icon: "💥", sort_order: 8, is_active: true },
    { id: "l-carnitine", name: "L-Carnitine", description: "Fat burning & recovery support", parent_category: "gym-essentials", icon: "🔥", sort_order: 9, is_active: true },
    { id: "testosterone-booster", name: "Testosterone Booster", description: "Natural testosterone support supplements", parent_category: "gym-essentials", icon: "💪", sort_order: 10, is_active: true },
    { id: "footwear", name: "Footwear", description: "Gym shoes, training shoes & sports footwear", parent_category: "imported", icon: "👟", sort_order: 0, is_active: true },
    { id: "clothes", name: "Clothes", description: "Gym wear, t-shirts, shorts & activewear", parent_category: "imported", icon: "👕", sort_order: 1, is_active: true },
    { id: "antique", name: "Antique", description: "Vintage & antique fitness equipment", parent_category: "imported", icon: "🏺", sort_order: 2, is_active: true },
  ];

  for (const sub of subcategories) {
    const { error } = await supabase.from("subcategories").upsert(sub, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed ${sub.id}:`, error.message);
    } else {
      console.log(`Seeded: ${sub.name}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);
