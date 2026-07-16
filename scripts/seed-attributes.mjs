import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const attributes = [
    { id: "size", name: "size", display_name: "Size", type: "select", is_variant: true, is_required: false, sort_order: 0, is_active: true },
    { id: "color", name: "color", display_name: "Color", type: "color", is_variant: true, is_required: false, sort_order: 1, is_active: true },
    { id: "flavour", name: "flavour", display_name: "Flavour", type: "select", is_variant: true, is_required: false, sort_order: 2, is_active: true },
    { id: "weight", name: "weight", display_name: "Weight", type: "select", is_variant: true, is_required: false, sort_order: 3, is_active: true },
    { id: "material", name: "material", display_name: "Material", type: "select", is_variant: true, is_required: false, sort_order: 4, is_active: true },
    { id: "pack-size", name: "pack-size", display_name: "Pack Size", type: "select", is_variant: true, is_required: false, sort_order: 5, is_active: true },
  ];

  for (const attr of attributes) {
    const { error } = await supabase.from("product_attributes").upsert(attr, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed attribute ${attr.id}:`, error.message);
    } else {
      console.log(`Seeded attribute: ${attr.display_name}`);
    }
  }

  const values = [
    { id: "size-s", attribute_id: "size", value: "s", display_value: "S", sort_order: 0, is_active: true },
    { id: "size-m", attribute_id: "size", value: "m", display_value: "M", sort_order: 1, is_active: true },
    { id: "size-l", attribute_id: "size", value: "l", display_value: "L", sort_order: 2, is_active: true },
    { id: "size-xl", attribute_id: "size", value: "xl", display_value: "XL", sort_order: 3, is_active: true },
    { id: "color-black", attribute_id: "color", value: "#000000", display_value: "Black", sort_order: 0, is_active: true },
    { id: "color-white", attribute_id: "color", value: "#ffffff", display_value: "White", sort_order: 1, is_active: true },
    { id: "color-blue", attribute_id: "color", value: "#0000ff", display_value: "Blue", sort_order: 2, is_active: true },
    { id: "flavour-chocolate", attribute_id: "flavour", value: "chocolate", display_value: "Chocolate", sort_order: 0, is_active: true },
    { id: "flavour-vanilla", attribute_id: "flavour", value: "vanilla", display_value: "Vanilla", sort_order: 1, is_active: true },
    { id: "flavour-strawberry", attribute_id: "flavour", value: "strawberry", display_value: "Strawberry", sort_order: 2, is_active: true },
    { id: "weight-300g", attribute_id: "weight", value: "300g", display_value: "300g", sort_order: 0, is_active: true },
    { id: "weight-500g", attribute_id: "weight", value: "500g", display_value: "500g", sort_order: 1, is_active: true },
    { id: "weight-1kg", attribute_id: "weight", value: "1kg", display_value: "1kg", sort_order: 2, is_active: true },
    { id: "weight-2kg", attribute_id: "weight", value: "2kg", display_value: "2kg", sort_order: 3, is_active: true },
    { id: "material-cotton", attribute_id: "material", value: "cotton", display_value: "Cotton", sort_order: 0, is_active: true },
    { id: "material-polyester", attribute_id: "material", value: "polyester", display_value: "Polyester", sort_order: 1, is_active: true },
    { id: "pack-size-single", attribute_id: "pack-size", value: "single", display_value: "Single Pack", sort_order: 0, is_active: true },
    { id: "pack-size-bundle", attribute_id: "pack-size", value: "bundle", display_value: "Bundle of 2", sort_order: 1, is_active: true },
  ];

  for (const val of values) {
    const { error } = await supabase.from("product_attribute_values").upsert(val, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed value ${val.id}:`, error.message);
    } else {
      console.log(`Seeded value: ${val.display_value || val.value}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);
