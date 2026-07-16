import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const assignments = [
    { id: "assign-1-1", product_id: "1", attribute_id: "flavour", is_required: true, is_variant: true, sort_order: 0 },
    { id: "assign-1-2", product_id: "1", attribute_id: "weight", is_required: false, is_variant: true, sort_order: 1 },
    { id: "assign-2-1", product_id: "2", attribute_id: "flavour", is_required: true, is_variant: true, sort_order: 0 },
    { id: "assign-5-1", product_id: "5", attribute_id: "flavour", is_required: false, is_variant: true, sort_order: 0 },
    { id: "assign-5-2", product_id: "5", attribute_id: "weight", is_required: true, is_variant: true, sort_order: 1 },
    { id: "assign-7-1", product_id: "7", attribute_id: "color", is_required: true, is_variant: true, sort_order: 0 },
    { id: "assign-12-1", product_id: "12", attribute_id: "size", is_required: true, is_variant: true, sort_order: 0 },
    { id: "assign-12-2", product_id: "12", attribute_id: "color", is_required: false, is_variant: true, sort_order: 1 },
  ];

  for (const a of assignments) {
    const { error } = await supabase.from("product_attribute_assignments").upsert(a, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed assignment ${a.id}:`, error.message);
    } else {
      console.log(`Seeded assignment: ${a.id}`);
    }
  }

  const variants = [
    { id: "var-1-choc-2kg", product_id: "1", sku: "GSP-001-CHOC-2KG", barcode: "1234567890123", price: 3499, stock: 25, weight: "2 kg", image: "https://images.unsplash.com/photo-1593095948071-474c5f298f9c?w=600&h=600&fit=crop", is_active: true, is_default: true, sort_order: 0 },
    { id: "var-1-vanilla-2kg", product_id: "1", sku: "GSP-001-VAN-2KG", barcode: "1234567890124", price: 3499, stock: 18, weight: "2 kg", image: "https://images.unsplash.com/photo-1593095948071-474c5f298f9c?w=600&h=600&fit=crop", is_active: true, is_default: false, sort_order: 1 },
    { id: "var-1-choc-5kg", product_id: "1", sku: "GSP-001-CHOC-5KG", barcode: "1234567890125", price: 4999, stock: 10, weight: "5 kg", image: "https://images.unsplash.com/photo-1593095948071-474c5f298f9c?w=600&h=600&fit=crop", is_active: true, is_default: false, sort_order: 2 },
    { id: "var-5-creatine-300g", product_id: "5", sku: "CRM-001-300G", barcode: "1234567890130", price: 899, stock: 42, weight: "300g", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop", is_active: true, is_default: true, sort_order: 0 },
    { id: "var-5-creatine-500g", product_id: "5", sku: "CRM-001-500G", barcode: "1234567890131", price: 1399, stock: 25, weight: "500g", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop", is_active: true, is_default: false, sort_order: 1 },
    { id: "var-7-blue", product_id: "7", sku: "SHK-001-BLUE", barcode: "1234567890140", price: 499, stock: 15, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb0886c?w=600&h=600&fit=crop", is_active: true, is_default: true, sort_order: 0 },
    { id: "var-7-black", product_id: "7", sku: "SHK-001-BLACK", barcode: "1234567890141", price: 499, stock: 12, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb0886c?w=600&h=600&fit=crop", is_active: true, is_default: false, sort_order: 1 },
    { id: "var-12-s-small", product_id: "12", sku: "GLV-S-SMALL", barcode: "1234567890150", price: 699, stock: 0, image: "https://images.unsplash.com/photo-1583454110551-21f2fe2ee8b7?w=600&h=600&fit=crop", is_active: true, is_default: true, sort_order: 0 },
    { id: "var-12-m-black", product_id: "12", sku: "GLV-M-BLACK", barcode: "1234567890151", price: 699, stock: 0, image: "https://images.unsplash.com/photo-1583454110551-21f2fe2ee8b7?w=600&h=600&fit=crop", is_active: true, is_default: false, sort_order: 1 },
  ];

  for (const v of variants) {
    const { error } = await supabase.from("product_variants").upsert(v, { onConflict: "id" });
    if (error) {
      console.error(`Failed to seed variant ${v.id}:`, error.message);
    } else {
      console.log(`Seeded variant: ${v.id}`);
    }
  }

  const variantValues = [
    { variant_id: "var-1-choc-2kg", attribute_value_id: "flavour-chocolate" },
    { variant_id: "var-1-choc-2kg", attribute_value_id: "weight-2kg" },
    { variant_id: "var-1-vanilla-2kg", attribute_value_id: "flavour-vanilla" },
    { variant_id: "var-1-vanilla-2kg", attribute_value_id: "weight-2kg" },
    { variant_id: "var-1-choc-5kg", attribute_value_id: "flavour-chocolate" },
    { variant_id: "var-1-choc-5kg", attribute_value_id: "weight-5kg" },
    { variant_id: "var-5-creatine-300g", attribute_value_id: "weight-300g" },
    { variant_id: "var-5-creatine-500g", attribute_value_id: "weight-500g" },
    { variant_id: "var-7-blue", attribute_value_id: "color-blue" },
    { variant_id: "var-7-black", attribute_value_id: "color-black" },
    { variant_id: "var-12-s-small", attribute_value_id: "size-s" },
    { variant_id: "var-12-s-small", attribute_value_id: "color-black" },
    { variant_id: "var-12-m-black", attribute_value_id: "size-m" },
    { variant_id: "var-12-m-black", attribute_value_id: "color-black" },
  ];

  for (const vv of variantValues) {
    const { error } = await supabase.from("product_variant_values").upsert(vv, { onConflict: "variant_id,attribute_value_id" });
    if (error) {
      console.error(`Failed to seed variant value ${vv.variant_id}:`, error.message);
    } else {
      console.log(`Seeded variant value: ${vv.variant_id} -> ${vv.attribute_value_id}`);
    }
  }

  console.log("Done!");
}

run().catch(console.error);
