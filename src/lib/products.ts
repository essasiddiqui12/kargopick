import { createAdminClient } from "@/lib/supabase/server";
import { productToRow, rowToProduct, rowToVariant, variantToRow } from "@/lib/supabase/mappers";
import { OrderItem, Product, ProductVariant, ProductFilters } from "@/types";

export const LOW_STOCK_THRESHOLD = Number(
  process.env.ADMIN_LOW_STOCK_THRESHOLD ?? 5
);

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function normalizeProduct(product: Product): Product {
  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const image = images[0] ?? product.image ?? "";

  let stock = product.stock ?? (product.inStock ? LOW_STOCK_THRESHOLD + 5 : 0);
  let price = product.price;
  let originalPrice = product.originalPrice;
  let inStock = product.inStock;

  if (product.variants && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.isActive);
    if (activeVariants.length > 0) {
      price = Math.min(...activeVariants.map((v) => v.price));
      stock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
      inStock = stock > 0;
      const maxOriginal = Math.max(...activeVariants.map((v) => v.originalPrice ?? 0));
      originalPrice = maxOriginal > 0 ? maxOriginal : undefined;
    }
  } else {
    stock = product.stock ?? (product.inStock ? LOW_STOCK_THRESHOLD + 5 : 0);
    inStock = stock > 0;
  }

  return { ...product, image, images, stock, inStock, price, originalPrice };
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
  const products = (data ?? []).map((row) => rowToProduct(row));

  const productIds = products.map((p) => p.id);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (variantsError) throw new Error(variantsError.message);

  const variantsByProductId = new Map<string, ProductVariant[]>();
  for (const row of variants ?? []) {
    const variant = rowToVariant(row);
    const list = variantsByProductId.get(variant.productId) || [];
    list.push(variant);
    variantsByProductId.set(variant.productId, list);
  }

  return products.map((p) => ({
    ...p,
    variants: variantsByProductId.get(p.id) || [],
  })).map((p) => normalizeProduct(p));
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

  const product = rowToProduct(data);

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (variantsError) throw new Error(variantsError.message);

  const mappedVariants = (variants ?? []).map((row) => rowToVariant(row));
  return normalizeProduct({ ...product, variants: mappedVariants });
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
  const id = crypto.randomUUID();
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
  const supabase = createAdminClient();

  for (const item of items) {
    if (item.variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .maybeSingle();

      const availableStock = variant?.stock ?? 0;
      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name} (${item.variantName}). Only ${availableStock} left.`
        );
      }
    } else {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .maybeSingle();

      const availableStock = product?.stock ?? 0;
      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name}. Only ${availableStock} left.`
        );
      }
    }
  }

  for (const item of items) {
    if (item.variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .maybeSingle();

      if (variant) {
        const newStock = Math.max(0, variant.stock - item.quantity);
        const { error } = await supabase
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", item.variantId);

        if (error) throw new Error(error.message);
      }
    } else {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .maybeSingle();

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        const { error } = await supabase
          .from("products")
          .update({ stock: newStock, in_stock: newStock > 0 })
          .eq("id", item.productId);

        if (error) throw new Error(error.message);
      }
    }
  }
}

export async function getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToVariant(row));
}

export async function createVariant(data: Omit<ProductVariant, "id">): Promise<ProductVariant> {
  const supabase = createAdminClient();
  const id = crypto.randomUUID();
  const variant = { ...data, id };
  const { error } = await supabase.from("product_variants").insert(variantToRow(variant));

  if (error) throw new Error(error.message);
  return variant;
}

export async function updateVariant(id: string, data: Partial<ProductVariant>): Promise<ProductVariant | null> {
  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) return null;

  const updated = { ...rowToVariant(existing), ...data };
  const { error } = await supabase
    .from("product_variants")
    .update(variantToRow(updated))
    .eq("id", id);

  if (error) throw new Error(error.message);
  return updated;
}

export async function deleteVariant(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("product_variants")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
