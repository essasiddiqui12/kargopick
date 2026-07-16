import { ProductAttribute, ProductAttributeValue, ProductAttributeAssignment, ProductVariant } from "@/types";

export function attributeToRow(attr: Partial<ProductAttribute> & { id?: string }) {
  return {
    id: attr.id,
    name: attr.name,
    display_name: attr.display_name,
    type: attr.type,
    is_variant: attr.is_variant ?? true,
    is_required: attr.is_required ?? false,
    sort_order: attr.sort_order ?? 0,
    is_active: attr.is_active ?? true,
  };
}

export function rowToAttribute(row: Record<string, unknown>): ProductAttribute {
  return {
    id: row.id as string,
    name: row.name as string,
    display_name: row.display_name as string,
    type: row.type as ProductAttribute["type"],
    is_variant: Boolean(row.is_variant),
    is_required: Boolean(row.is_required),
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active),
  };
}

export function attributeValueToRow(value: Partial<ProductAttributeValue> & { id?: string; attribute_id?: string }) {
  return {
    id: value.id,
    attribute_id: value.attribute_id,
    value: value.value,
    display_value: value.display_value || null,
    meta_data: value.meta_data || null,
    sort_order: value.sort_order ?? 0,
    is_active: value.is_active ?? true,
  };
}

export function rowToAttributeValue(row: Record<string, unknown>): ProductAttributeValue {
  return {
    id: row.id as string,
    attribute_id: row.attribute_id as string,
    value: row.value as string,
    display_value: (row.display_value as string) || undefined,
    meta_data: (row.meta_data as Record<string, unknown>) || undefined,
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active),
  };
}

export function assignmentToRow(assignment: Partial<ProductAttributeAssignment> & { id?: string; product_id?: string; attribute_id?: string }) {
  return {
    id: assignment.id,
    product_id: assignment.product_id,
    attribute_id: assignment.attribute_id,
    is_required: assignment.is_required ?? false,
    is_variant: assignment.is_variant ?? true,
    sort_order: assignment.sort_order ?? 0,
  };
}

export function rowToAssignment(row: Record<string, unknown>): ProductAttributeAssignment {
  return {
    id: row.id as string,
    product_id: row.product_id as string,
    attribute_id: row.attribute_id as string,
    is_required: Boolean(row.is_required),
    is_variant: Boolean(row.is_variant),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export function variantToRow(variant: Partial<ProductVariant> & { id?: string; product_id?: string }) {
  return {
    id: variant.id,
    product_id: variant.product_id,
    sku: variant.sku || null,
    barcode: variant.barcode || null,
    price: variant.price ?? null,
    stock: variant.stock ?? 0,
    weight: variant.weight || null,
    image: variant.image || null,
    is_active: variant.is_active ?? true,
    is_default: variant.is_default ?? false,
    sort_order: variant.sort_order ?? 0,
  };
}

export function rowToVariant(row: Record<string, unknown>, attributeValues: ProductAttributeValue[] = []): ProductVariant {
  return {
    id: row.id as string,
    product_id: row.product_id as string,
    sku: (row.sku as string) || undefined,
    barcode: (row.barcode as string) || undefined,
    price: row.price ? Number(row.price) : undefined,
    stock: Number(row.stock ?? 0),
    weight: (row.weight as string) || undefined,
    image: (row.image as string) || undefined,
    is_active: Boolean(row.is_active),
    is_default: Boolean(row.is_default),
    sort_order: Number(row.sort_order ?? 0),
    attribute_values: attributeValues,
  };
}
