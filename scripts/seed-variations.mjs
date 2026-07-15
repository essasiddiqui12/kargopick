import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const variations = [
    { id: "whey-protein-chocolate", product_id: "1", type: "flavor", value: "Chocolate", price_adjustment: 0, stock: 25, is_default: true, sort_order: 0, is_active: true },
    { id: "whey-protein-vanilla", product_id: "1", type: "flavor", value: "Vanilla", price_adjustment: 0, stock: 18, is_default: false, sort_order: 1, is_active: true },
    { id: "whey-protein-strawberry", product_id: "1", type: "flavor", value: "Strawberry", price_adjustment: 100, stock: 10, is_default: false, sort_order: 2, is_active: true },
    { id: "mass-gainer-2kg", product_id: "2", type: "weight", value: "2 kg", price_adjustment: 0, stock: 18, is_default: true, sort_order: 0, is_active: true },
    { id: "mass-gainer-5kg", product_id: "2", type: "weight", value: "5 kg", price_adjustment: 1500, stock: 8, is_default: false, sort_order: 1, is_active: true },
    { id: "creatine-300g", product_id: "5", type: "weight", value: "300g", price_adjustment: 0, stock: 42, is_default: true, sort_order: 0, is_active: true },
    { id: "creatine-500g", product_id: "5", type: "weight", value: "500g", price_adjustment: 500, stock: 25, is_default: false, sort_order: 1, is_active: true },
    { id: "shaker-blue", product_id: "7", type: "color", value: "Blue", price_adjustment: 0, stock: 15, is_default: true, sort_order: 0, is_active: true },
    { id: "shaker-black", product_id: "7", type: "color", value: "Black", price_adjustment: 0, stock: 12, is_default: false, sort_order: 1, is_active: true },
    { id: "resistance-set-basic", product_id: "9", type: "other", value: "Basic Set", price_adjustment: 0, stock: 12, is_default: true, sort_order: 0, is_active: true },
    { id: "resistance-set-pro", product_id: "9", type: "other", value: "Pro Set", price_adjustment: 300, stock: 6, is_default: false, sort_order: 1, is_active: true },
    { id: "gloves-small", product_id: "12", type: "size", value: "Small", price_adjustment: 0, stock: 0, is_default: true, sort_order: 0, is_active: true },
    { id: "gloves-medium", product_id: "12", type: "size", value: "Medium", price_adjustment: 0, stock: 0, is_default: false, sort_order: 1, is_active: true },
  ];

  for (const v of variations) {
    const { error } = await supabase.from("product_variations").upsert(v, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed ${v.id}:`, error.message);
    } else {
      console.log(`Seeded: ${v.value}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);
