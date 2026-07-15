import { ProductVariation } from "@/types";

export function variationToRow(variation: Partial<ProductVariation> & { id?: string; productId?: string }) {
  return {
    id: variation.id,
    product_id: variation.productId,
    type: variation.type,
    value: variation.value,
    price_adjustment: variation.priceAdjustment ?? 0,
    image: variation.image ?? null,
    sku: variation.sku ?? null,
    stock: variation.stock ?? 0,
    is_default: variation.isDefault ?? false,
    sort_order: variation.sortOrder ?? 0,
    is_active: variation.isActive ?? true,
  };
}

export function rowToVariation(row: Record<string, unknown>): ProductVariation {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    type: row.type as ProductVariation["type"],
    value: row.value as string,
    priceAdjustment: Number(row.price_adjustment ?? 0),
    image: (row.image as string) || undefined,
    sku: (row.sku as string) || undefined,
    stock: Number(row.stock ?? 0),
    isDefault: Boolean(row.is_default),
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
  };
}
