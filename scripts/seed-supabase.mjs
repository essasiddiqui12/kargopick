import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const dataDir = join(process.cwd(), "data");

function loadJson(file) {
  return JSON.parse(readFileSync(join(dataDir, file), "utf-8"));
}

async function seed() {
  const products = loadJson("products.json");
  const coupons = loadJson("coupons.json");

  const productRows = products.map((p) => {
    const images =
      p.images?.length > 0 ? p.images : p.image ? [p.image] : [];
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.originalPrice ?? null,
      category: p.category,
      image: images[0] ?? p.image,
      images,
    badge: p.badge ?? null,
    rating: p.rating,
    reviews: p.reviews,
    stock: p.stock ?? (p.inStock ? 10 : 0),
    in_stock: p.inStock,
    weight: p.weight ?? null,
    origin: p.origin ?? null,
    };
  });

  const couponRows = coupons.map((c) => ({
    id: c.id,
    code: String(c.code).toUpperCase(),
    type: c.type,
    value: c.value,
    min_order: c.minOrder ?? null,
    max_uses: c.maxUses ?? null,
    used_count: c.usedCount ?? 0,
    expires_at: c.expiresAt ?? null,
    active: c.active ?? true,
    description: c.description ?? null,
  }));

  const { error: productsError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id" });

  if (productsError) {
    console.error("Products seed failed:", productsError.message);
    process.exit(1);
  }

  const { error: couponsError } = await supabase
    .from("coupons")
    .upsert(couponRows, { onConflict: "id" });

  if (couponsError) {
    console.error("Coupons seed failed:", couponsError.message);
    process.exit(1);
  }

  console.log(`Seeded ${productRows.length} products and ${couponRows.length} coupons.`);
}

seed();
