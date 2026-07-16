import { createAdminClient } from "@/lib/supabase/server";
import { productToRow, rowToProduct } from "@/lib/supabase/mappers";
import { OrderItem, Product, ProductFilters } from "@/types";

export const LOW_STOCK_THRESHOLD = Number(
  process.env.ADMIN_LOW_STOCK_THRESHOLD ?? 5
);

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function normalizeProduct(product: Product): Product {
  const stock =
    product.stock ?? (product.inStock ? LOW_STOCK_THRESHOLD + 5 : 0);
  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const image = images[0] ?? product.image ?? "";
  return { ...product, image, images, stock, inStock: stock > 0 };
}

export function syncStockFields(data: {
  stock?: number;
  inStock?: boolean;
}): { stock: number; inStock: boolean } {
  const stock = Math.max(0, Math.floor(data.stock ?? 0));
  return { stock, inStock: stock > 0 };
}

export function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products
    .filter((p) => getStockStatus(p) === "low_stock")
    .sort((a, b) => a.stock - b.stock);
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((p) => getStockStatus(p) === "out_of_stock");
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeProduct(rowToProduct(row)));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return undefined;

  const product = normalizeProduct(rowToProduct(data));

  const { data: variantsData } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const variantsWithValues = (variantsData || []).map((variant) => ({
    id: variant.id,
    product_id: variant.product_id,
    type: variant.type || "other",
    value: variant.value,
    priceAdjustment: Number(variant.price_adjustment || 0),
    stock: Number(variant.stock || 0),
    sku: variant.sku,
    barcode: variant.barcode,
    image: variant.image,
    weight: variant.weight,
    is_active: variant.is_active,
    is_default: variant.is_default,
    sort_order: variant.sort_order,
  }));

  return {
    ...product,
    variants: variantsWithValues,
  };
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const products = await getProducts();
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.badge).slice(0, 4);
}

export async function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Promise<Product[]> {
  const products = await getProducts();
  const sameCategory = products.filter(
    (p) => p.id !== productId && p.category === category
  );
  const others = products.filter(
    (p) => p.id !== productId && p.category !== category
  );

  return [...sameCategory, ...others]
    .sort((a, b) => Number(b.inStock) - Number(a.inStock))
    .slice(0, limit);
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let result = [...products];

  if (filters.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.subcategory) {
    result = result.filter((p) => p.subcategory === filters.subcategory);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.badge?.toLowerCase().includes(q)
    );
  }

  if (filters.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.inStock === true) {
    result = result.filter((p) => p.inStock);
  } else if (filters.inStock === false) {
    result = result.filter((p) => !p.inStock);
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
  }

  return result;
}

export async function searchProducts(
  filters: ProductFilters
): Promise<Product[]> {
  const products = await getProducts();
  return filterProducts(products, filters);
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const supabase = createAdminClient();
  const products = await getProducts();
  const id = String(
    Math.max(0, ...products.map((p) => parseInt(p.id, 10) || 0)) + 1
  );
  const stockFields = syncStockFields(data);
  const product = normalizeProduct({ ...data, ...stockFields, id });
  const { error } = await supabase.from("products").insert(productToRow(product));

  if (error) throw new Error(error.message);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const stockFields =
    data.stock !== undefined || data.inStock !== undefined
      ? syncStockFields({ ...existing, ...data })
      : {};

  const product = normalizeProduct({
    ...existing,
    ...data,
    ...stockFields,
    id,
  });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update(productToRow(product))
    .eq("id", id);

  if (error) throw new Error(error.message);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function reserveStockForOrder(items: OrderItem[]): Promise<void> {
  const products = await getProducts();

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Only ${product.stock} left.`
      );
    }
  }

  const supabase = createAdminClient();

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const stock = Math.max(0, product.stock - item.quantity);
    const { error } = await supabase
      .from("products")
      .update({ stock, in_stock: stock > 0 })
      .eq("id", item.productId);

    if (error) throw new Error(error.message);
  }
}
