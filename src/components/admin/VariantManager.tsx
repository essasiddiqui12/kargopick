"use client";

import { useState, useEffect } from "react";
import { ProductVariant } from "@/types";
import { Loader2, Plus, Trash2, Edit3, Save, X } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const emptyVariant = (productId: string): Omit<ProductVariant, "id"> => ({
  productId,
  name: "",
  sku: "",
  price: 0,
  originalPrice: undefined,
  stock: 0,
  image: "",
  attributes: {},
  isDefault: false,
  sortOrder: 0,
  isActive: true,
});

export default function VariantManager({
  productId,
  variants,
  onChange,
}: VariantManagerProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVariant(productId));
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchVariants() {
      setLoading(true);
      try {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
        const res = await fetch(`${baseUrl}/api/admin/variants?product_id=${productId}`);
        if (res.ok) {
          const data = await res.json();
          onChange(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  function resetForm() {
    setForm(emptyVariant(productId));
    setAttrKey("");
    setAttrValue("");
    setEditingId(null);
  }

  function startEdit(variant: ProductVariant) {
    setForm({
      productId: variant.productId,
      name: variant.name,
      sku: variant.sku || "",
      price: variant.price,
      originalPrice: variant.originalPrice,
      stock: variant.stock,
      image: variant.image || "",
      attributes: { ...variant.attributes },
      isDefault: variant.isDefault,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
    });
    setEditingId(variant.id);
    setAttrKey("");
    setAttrValue("");
  }

  function addAttribute() {
    if (!attrKey.trim() || !attrValue.trim()) return;
    setForm((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrKey.trim()]: attrValue.trim(),
      },
    }));
    setAttrKey("");
    setAttrValue("");
  }

  function removeAttribute(key: string) {
    setForm((prev) => {
      const next = { ...prev.attributes };
      delete next[key];
      return { ...prev, attributes: next };
    });
  }

  async function submitVariant() {
    setSaving(true);

    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";

      const isNew = editingId === "__new__";
      const url = isNew
        ? `${baseUrl}/api/admin/variants`
        : `${baseUrl}/api/admin/variants/${editingId}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save variant");
      }

      const saved = await res.json();
      if (isNew) {
        onChange([...variants, saved]);
      } else {
        onChange(variants.map((v) => (v.id === saved.id ? saved : v)));
      }

      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitVariant();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this variant?")) return;

    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "https://kargopick.vercel.app";
      const res = await fetch(`${baseUrl}/api/admin/variants/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete variant");
      }

      onChange(variants.filter((v) => v.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1";

  return (
    <div className="sm:col-span-2 border-t border-surface-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-900">Variants</h3>
        {!editingId && (
          <button
            type="button"
            onClick={() => {
              setForm(emptyVariant(productId));
              setEditingId("__new__");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading variants...
        </div>
      ) : (
        <div className="space-y-4">
          {editingId && (
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Variant Name *</label>
                  <input
                    required
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Chocolate / 1 kg"
                  />
                </div>

                <div>
                  <label className={labelClass}>SKU</label>
                  <input
                    className={inputClass}
                    value={form.sku}
                    onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder="GSWP-CHOC-1KG"
                  />
                </div>

                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.sortOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelClass}>Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelClass}>Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.originalPrice ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="For showing discount"
                  />
                </div>

                <div>
                  <label className={labelClass}>Stock *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelClass}>Image</label>
                    <ImageUploadField
                      value={form.image || ""}
                      onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                    />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Attributes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(form.attributes).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-sm text-brand-700"
                      >
                        <span className="font-medium capitalize">{key}:</span> {value}
                        <button
                          type="button"
                          onClick={() => removeAttribute(key)}
                          className="text-brand-400 hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={attrKey}
                      onChange={(e) => setAttrKey(e.target.value)}
                      placeholder="Key (e.g. flavor)"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAttribute())}
                    />
                    <input
                      className={inputClass}
                      value={attrValue}
                      onChange={(e) => setAttrValue(e.target.value)}
                      placeholder="Value (e.g. Chocolate)"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAttribute())}
                    />
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm text-surface-700">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    />
                    Default variant
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-surface-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitVariant}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!editingId && (
            <button
              type="button"
              onClick={() => setEditingId("__new__")}
              className="w-full rounded-xl border-2 border-dashed border-surface-200 py-3 text-sm font-medium text-surface-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              + Add Variant
            </button>
          )}

          {variants.length === 0 && !editingId && (
            <p className="text-sm text-surface-400">No variants yet. Add one above.</p>
          )}

          <div className="space-y-2">
            {variants
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {variant.name}
                      {variant.isDefault && (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      ₹{variant.price} · Stock: {variant.stock}
                      {Object.keys(variant.attributes).length > 0 && (
                        <span>
                          {" · "}
                          {Object.entries(variant.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => startEdit(variant)}
                      className="p-2 text-surface-400 hover:text-brand-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(variant.id)}
                      className="p-2 text-surface-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
