import { CartItem, Product } from "@/types";

export interface CartStockIssue {
  productId: string;
  name: string;
  message: string;
}

export function getCartStockIssue(
  item: CartItem,
  live?: Product
): CartStockIssue | null {
  if (!live) {
    return {
      productId: item.product.id,
      name: item.product.name,
      message: "No longer available — remove from cart",
    };
  }

  if (item.variantId && live.variants) {
    const variant = live.variants.find((v) => v.id === item.variantId);
    if (!variant) {
      return {
        productId: item.product.id,
        name: item.product.name,
        message: "Selected option is no longer available — remove from cart",
      };
    }

    if (variant.stock <= 0) {
      return {
        productId: item.product.id,
        name: live.name,
        message: "Out of stock — remove from cart",
      };
    }

    if (item.quantity > variant.stock) {
      return {
        productId: item.product.id,
        name: live.name,
        message: `Only ${variant.stock} left — quantity adjusted to ${variant.stock}`,
      };
    }
    return null;
  }

  const effectiveStock = live.stock;

  if (effectiveStock <= 0) {
    return {
      productId: item.product.id,
      name: live.name,
      message: "Out of stock — remove from cart",
    };
  }

  if (item.quantity > effectiveStock) {
    return {
      productId: item.product.id,
      name: live.name,
      message: `Only ${effectiveStock} left — quantity adjusted to ${effectiveStock}`,
    };
  }

  return null;
}

export function validateCartItems(
  items: CartItem[],
  products: Product[]
): { issues: CartStockIssue[]; syncedItems: CartItem[] } {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const issues: CartStockIssue[] = [];
  const syncedItems: CartItem[] = [];

  for (const item of items) {
    const live = productMap.get(item.product.id);

    let syncedItem: CartItem = live ? { ...item, product: live } : item;

    if (live) {
      const cap = item.variantId
        ? live.variants?.find((v) => v.id === item.variantId)?.stock ?? live.stock
        : live.stock;

      if (cap > 0 && syncedItem.quantity > cap) {
        syncedItem = { ...syncedItem, quantity: cap };
      }
    }

    syncedItems.push(syncedItem);

    const issue = getCartStockIssue(syncedItem, live);
    if (issue) issues.push(issue);
  }

  return { issues, syncedItems };
}

export async function fetchLiveProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to check product availability");
  return res.json();
}
