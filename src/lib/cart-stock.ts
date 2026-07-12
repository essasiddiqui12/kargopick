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

  if (live.stock <= 0 || !live.inStock) {
    return {
      productId: item.product.id,
      name: live.name,
      message: "Out of stock — remove from cart",
    };
  }

  if (item.quantity > live.stock) {
    return {
      productId: item.product.id,
      name: live.name,
      message: `Only ${live.stock} left — reduce quantity to ${live.stock}`,
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
    const syncedItem: CartItem = live
      ? { ...item, product: live }
      : item;

    syncedItems.push(syncedItem);

    const issue = getCartStockIssue(item, live);
    if (issue) issues.push(issue);
  }

  return { issues, syncedItems };
}

export async function fetchLiveProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to check product availability");
  return res.json();
}
