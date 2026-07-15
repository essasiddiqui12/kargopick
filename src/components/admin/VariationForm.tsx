"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { ProductVariation, VariationType } from "@/types";

interface VariationFormProps {
  productId: string;
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

const VARIATION_TYPES: { value: VariationType; label: string }[] = [
  { value: "flavor", label: "Flavor" },
  { value: "size", label: "Size" },
  { value: "color", label: "Color" },
  { value: "weight", label: "Weight" },
  { value: "other", label: "Other" },
];

export default function VariationForm({ productId, variations, onChange }: VariationFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    type: "flavor" as VariationType,
    value: "",
    priceAdjustment: "0",
    image: "",
    sku: "",
    stock: "0",
    isDefault: false,
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!editingId) {
      setForm({
        id: "",
        type: "flavor",
        value: "",
        priceAdjustment: "0",
        image: "",
        sku: "",
        stock: "0",
        isDefault: false,
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [editingId]);

  function resetForm() {
    setEditingId(null);
    setForm({
      id: "",
      type: "flavor",
      value: "",
      priceAdjustment: "0",
      image: "",
      sku: "",
      stock: "0",
      isDefault: false,
      sortOrder: 0,
      isActive: true,
    });
  }

  function startEdit(variation: ProductVariation) {
    setEditingId(variation.id);
    setForm({
      id: variation.id,
      type: variation.type,
      value: variation.value,
      priceAdjustment: String(variation.priceAdjustment),
      image: variation.image || "",
      sku: variation.sku || "",
      stock: String(variation.stock),
      isDefault: variation.isDefault,
      sortOrder: variation.sortOrder,
      isActive: variation.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch("/api/admin/variations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingId }),
        });
        if (!res.ok) throw new Error("Failed to update variation");
        onChange(
          variations.map((v) =>
            v.id === editingId
              ? {
                  ...v,
                  type: form.type,
                  value: form.value,
                  priceAdjustment: Number(form.priceAdjustment) || 0,
                  image: form.image || undefined,
                  sku: form.sku || undefined,
                  stock: Number(form.stock) || 0,
                  isDefault: form.isDefault,
                  sortOrder: form.sortOrder,
                  isActive: form.isActive,
                }
              : form.isDefault
                ? { ...v, isDefault: false }
                : v
          )
        );
      } else {
        const newId = `${productId}-${form.type}-${Date.now()}`;
        const res = await fetch("/api/admin/variations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            id: newId,
            productId,
          }),
        });
        if (!res.ok) throw new Error("Failed to create variation");
        const newVariation: ProductVariation = {
          id: newId,
          productId,
          type: form.type,
          value: form.value,
          priceAdjustment: Number(form.priceAdjustment) || 0,
          image: form.image || undefined,
          sku: form.sku || undefined,
          stock: Number(form.stock) || 0,
          isDefault: form.isDefault,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
        };
        onChange([...variations, newVariation]);
      }

      resetForm();
    } catch {
      alert("Failed to save variation");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariation(id: string) {
    if (!confirm("Delete this variation?")) return;
    try {
      const res = await fetch("/api/admin/variations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      onChange(variations.filter((v) => v.id !== id));
      if (editingId === id) resetForm();
    } catch {
      alert("Failed to delete variation");
    }
  }

  const grouped = variations.reduce<Record<string, ProductVariation[]>>((acc, v) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-surface-900">Product Variations</h3>
      <p className="text-sm text-surface-500">Add options like flavor, size, color, or other choices for this product.</p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-surface-900">
            {editingId ? "Edit Variation" : "New Variation"}
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
              onChange={(e) => setForm({ ...form, type: e.target.value as VariationType })}
              disabled={!!editingId}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            >
              {VARIATION_TYPES.map((t) => (
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
              placeholder="Chocolate, 2kg, Blue..."
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
            <label className="block text-sm font-medium text-surface-700 mb-1">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Variation Image URL (optional)</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700">Default variation</span>
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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Variation" : "Add Variation"}
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

      {variations.length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
              <div className="bg-surface-50 px-4 py-3 border-b border-surface-200">
                <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
                  {VARIATION_TYPES.find((t) => t.value === type)?.label || type}
                </h4>
              </div>
              <div className="divide-y divide-surface-100">
                {items.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-surface-900">{v.value}</span>
                        {v.isDefault && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Default</span>
                        )}
                        {!v.isActive && (
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(v)}
                        className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteVariation(v.id)}
                        className="rounded-lg border border-rose-200 bg-white p-2 text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {variations.length === 0 && !editingId && (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-8 text-center">
          <p className="text-sm text-surface-500">No variations yet. Use the form above to add your first variation.</p>
        </div>
      )}
    </div>
  );
}
