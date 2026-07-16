import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join("=").trim();
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const productId = `prod-${Date.now()}`;
  const productName = "Premium Whey Protein";

  console.log("Creating product...");
  const { error: productError } = await supabase.from("products").insert({
    id: productId,
    name: productName,
    description:
      "Premium whey protein concentrate with 24g protein per serving. Perfect for muscle growth and recovery.",
    price: 2499,
    original_price: 2999,
    category: "gym-essentials",
    subcategory: "whey-protein",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    ],
    stock: 100,
    in_stock: true,
    weight: "1 kg",
    origin: "USA",
    rating: 4.7,
    reviews: 128,
    badge: "Best Seller",
  });

  if (productError) {
    console.error("Failed to create product:", productError);
    process.exit(1);
  }

  console.log("Product created:", productId);

  console.log("Creating variants...");
  const variants = [
    {
      id: `${productId}-flavor-chocolate`,
      product_id: productId,
      type: "flavor",
      value: "Chocolate",
      price_adjustment: 0,
      stock: 40,
      image:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=600&fit=crop",
      is_default: true,
      is_active: true,
      sort_order: 0,
    },
    {
      id: `${productId}-flavor-vanilla`,
      product_id: productId,
      type: "flavor",
      value: "Vanilla",
      price_adjustment: 100,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop",
      is_default: false,
      is_active: true,
      sort_order: 1,
    },
    {
      id: `${productId}-flavor-strawberry`,
      product_id: productId,
      type: "flavor",
      value: "Strawberry",
      price_adjustment: 100,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=600&h=600&fit=crop",
      is_default: false,
      is_active: true,
      sort_order: 2,
    },
    {
      id: `${productId}-size-1kg`,
      product_id: productId,
      type: "size",
      value: "1kg",
      price_adjustment: 0,
      stock: 50,
      is_default: true,
      is_active: true,
      sort_order: 0,
    },
    {
      id: `${productId}-size-2kg`,
      product_id: productId,
      type: "size",
      value: "2kg",
      price_adjustment: 800,
      stock: 25,
      is_default: false,
      is_active: true,
      sort_order: 1,
    },
    {
      id: `${productId}-size-5kg`,
      product_id: productId,
      type: "size",
      value: "5kg",
      price_adjustment: 1800,
      stock: 10,
      is_default: false,
      is_active: true,
      sort_order: 2,
    },
  ];

  const { error: variantsError } = await supabase.from("product_variants").insert(variants);
  if (variantsError) {
    console.error("Failed to create variants:", variantsError);
    process.exit(1);
  }

  console.log(`Created ${variants.length} variants`);

  const siteUrl =
    env.NEXT_PUBLIC_SITE_URL ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");

  console.log("\nView product at:");
  console.log(`${siteUrl}/products/${productId}`);

  console.log("\nVariants created:");
  variants.forEach((v) => {
    console.log(
      `- ${v.value} (${v.type}): ₹${v.price_adjustment > 0 ? "+" + v.price_adjustment : "base"} | stock: ${v.stock}`
    );
  });
}

main();
