const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
const content = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  if (key && rest.length > 0) env[key.trim()] = rest.join("=").trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("=== All Variants in Database ===\n");
  
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Total variants: ${variants?.length || 0}\n`);
  
  variants?.forEach((v, i) => {
    console.log(`${i + 1}. Product: ${v.product_id}`);
    console.log(`   Type: ${v.type}, Value: "${v.value}"`);
    console.log(`   Price Adjustment: ${v.price_adjustment}, Stock: ${v.stock}`);
    console.log(`   Active: ${v.is_active}, Default: ${v.is_default}`);
    console.log(`   Image: ${v.image || "none"}`);
    console.log(`   Created: ${v.created_at}`);
    console.log("");
  });

  // Check if any variants were recently created (last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recentVariants = variants?.filter((v) => v.created_at > tenMinutesAgo);
  
  if (recentVariants?.length > 0) {
    console.log(`\n=== Recently Created Variants (last 10 min) ===`);
    recentVariants.forEach((v) => {
      console.log(`- ${v.value} (${v.type}) for product ${v.product_id}`);
    });
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
