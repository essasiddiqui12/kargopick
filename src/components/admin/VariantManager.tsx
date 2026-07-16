"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { ProductVariant, VariantType } from "@/types";

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const VARIANT_TYPES: { value: VariantType; label: string }[] = [
  { value: "flavor", label: "Flavour" },
  { value: "size", label: "Size" },
  { value: "weight", label: "Weight" },
  { value: "color", label: "Color" },
  { value: "other", label: "Other" },
];

export default function VariantManager({ productId, variants, onChange }: VariantManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    type: "flavor" as VariantType,
    value: "",
    priceAdjustment: "0",
    stock: "0",
    sku: "",
    barcode: "",
    image: "",
    weight: "",
    isDefault: false,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (!editingId) {
      setForm({
        id: "",
        type: "flavor",
        value: "",
        priceAdjustment: "0",
        stock: "0",
        sku: "",
        barcode: "",
        image: "",
        weight: "",
        isDefault: false,
        isActive: true,
        sortOrder: variants.length,
      });
    }
  }, [editingId, variants.length]);

  function resetForm() {
    setEditingId(null);
    setForm({
      id: "",
      type: "flavor",
      value: "",
      priceAdjustment: "0",
      stock: "0",
      sku: "",
      barcode: "",
      image: "",
      weight: "",
      isDefault: false,
      isActive: true,
      sortOrder: variants.length,
    });
  }

  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id);
    setForm({
      id: variant.id,
      type: variant.type,
      value: variant.value,
      priceAdjustment: String(variant.priceAdjustment),
      stock: String(variant.stock),
      sku: variant.sku || "",
      barcode: variant.barcode || "",
      image: variant.image || "",
      weight: variant.weight || "",
      isDefault: variant.is_default,
      isActive: variant.is_active,
      sortOrder: variant.sort_order,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Variant form submitted", { productId, form });
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch("/api/admin/variants", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            type: form.type,
            value: form.value,
            price_adjustment: Number(form.priceAdjustment) || 0,
            stock: Number(form.stock) || 0,
            sku: form.sku || null,
            barcode: form.barcode || null,
            image: form.image || null,
            weight: form.weight || null,
            is_default: form.isDefault,
            is_active: form.isActive,
            sort_order: form.sortOrder,
          }),
        });
        console.log("Update variant response:", res.status, await res.clone().text());
        if (!res.ok) throw new Error("Failed to update variant");
        onChange(
          variants.map((v) =>
            v.id === editingId
              ? {
                  ...v,
                  type: form.type,
                  value: form.value,
                  priceAdjustment: Number(form.priceAdjustment) || 0,
                  stock: Number(form.stock) || 0,
                  sku: form.sku || undefined,
                  barcode: form.barcode || undefined,
                  image: form.image || undefined,
                  weight: form.weight || undefined,
                  is_default: form.isDefault,
                  is_active: form.isActive,
                  sort_order: form.sortOrder,
                }
              : form.isDefault
                ? { ...v, is_default: false }
                : v
          )
        );
      } else {
        const newId = `variant-${productId}-${Date.now()}`;
        console.log("Creating variant with ID:", newId);
        const res = await fetch("/api/admin/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newId,
            product_id: productId,
            type: form.type,
            value: form.value,
            price_adjustment: Number(form.priceAdjustment) || 0,
            stock: Number(form.stock) || 0,
            sku: form.sku || null,
            barcode: form.barcode || null,
            image: form.image || null,
            weight: form.weight || null,
            is_default: form.isDefault,
            is_active: form.isActive,
            sort_order: form.sortOrder,
          }),
        });
        const responseText = await res.clone().text();
        console.log("Create variant response:", res.status, responseText);
        if (!res.ok) throw new Error("Failed to create variant: " + responseText);
        const newVariant: ProductVariant = {
          id: newId,
          product_id: productId,
          type: form.type,
          value: form.value,
          priceAdjustment: Number(form.priceAdjustment) || 0,
          stock: Number(form.stock) || 0,
          sku: form.sku || undefined,
          barcode: form.barcode || undefined,
          image: form.image || undefined,
          weight: form.weight || undefined,
          is_default: form.isDefault,
          is_active: form.isActive,
          sort_order: form.sortOrder,
        };
        onChange([...variants, newVariant]);
      }

      resetForm();
    } catch (error) {
      console.error("Variant save error:", error);
      alert("Failed to save variant: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(id: string) {
    if (!confirm("Delete this variant?")) return;
    try {
      const res = await fetch("/api/admin/variants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      onChange(variants.filter((v) => v.id !== id));
      if (editingId === id) resetForm();
    } catch {
      alert("Failed to delete variant");
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-surface-900">Product Variants</h3>
      <p className="text-sm text-surface-500">
        Add options like flavour, size, weight, or color. Each variant can have its own price, stock, SKU, and image.
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-surface-900">
            {editingId ? "Edit Variant" : "New Variant"}
          </h4>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-surface-400 hover:text-surface-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as VariantType })}
              disabled={!!editingId}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            >
              {VARIANT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Value *</label>
            <input
              type="text"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Chocolate, 2kg, Blue, M..."
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Price Adjustment (₹)</label>
            <input
              type="number"
              value={form.priceAdjustment}
              onChange={(e) => setForm({ ...form, priceAdjustment: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="0"
            />
            <p className="text-xs text-surface-400 mt-1">Extra cost over base price. Use negative for discount.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Stock *</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">SKU (optional)</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="SKU-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Weight (optional)</label>
            <input
              type="text"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="2 kg, 500g..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Variant Image URL (optional)</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="https://example.com/image.jpg"
          />
          {form.image && (
            <div className="mt-2 relative h-32 w-full overflow-hidden rounded-lg border border-surface-200">
              <img src={form.image} alt="Variant preview" className="h-full w-full object-contain" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700">Default variant</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700">Active</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Variant" : "Add Variant"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-surface-200 bg-white px-6 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {variants.length > 0 && (
        <div className="space-y-3">
          {VARIANT_TYPES.map((type) => {
            const typeVariants = variants
              .filter((v) => v.type === type.value)
              .sort((a, b) => a.sort_order - b.sort_order);

            if (typeVariants.length === 0) return null;

            return (
              <div key={type.value} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
                <div className="bg-surface-50 px-4 py-3 border-b border-surface-200">
                  <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
                    {type.label}
                  </h4>
                </div>
                <div className="divide-y divide-surface-100">
                  {typeVariants.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-surface-900">{v.value}</span>
                          {v.is_default && (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Default</span>
                          )}
                          {!v.is_active && (
                            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500">Inactive</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
                          {v.priceAdjustment !== 0 && (
                            <span className={v.priceAdjustment > 0 ? "text-emerald-600" : "text-rose-600"}>
                              {v.priceAdjustment > 0 ? "+" : ""}₹{v.priceAdjustment}
                            </span>
                          )}
                          <span>Stock: {v.stock}</span>
                          {v.sku && <span>SKU: {v.sku}</span>}
                          {v.weight && <span>Weight: {v.weight}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(v)}
                          className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVariant(v.id)}
                          className="rounded-lg border border-rose-200 bg-white p-2 text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {variants.length === 0 && !editingId && (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-8 text-center">
          <p className="text-sm text-surface-500">No variants yet. Use the form above to add your first variant.</p>
        </div>
      )}
    </div>
  );
}
