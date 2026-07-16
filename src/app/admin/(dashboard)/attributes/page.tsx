"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { ProductAttribute } from "@/types";

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProductAttribute | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    name: "",
    display_name: "",
    type: "select" as ProductAttribute["type"],
    is_variant: true,
    is_required: false,
    sort_order: 0,
    is_active: true,
  });

  async function fetchAttributes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attributes");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setAttributes(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAttributes();
  }, []);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      display_name: "",
      type: "select",
      is_variant: true,
      is_required: false,
      sort_order: 0,
      is_active: true,
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(attr: ProductAttribute) {
    setForm({
      id: attr.id,
      name: attr.name,
      display_name: attr.display_name,
      type: attr.type,
      is_variant: attr.is_variant,
      is_required: attr.is_required,
      sort_order: attr.sort_order,
      is_active: attr.is_active,
    });
    setEditing(attr);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = "/api/admin/attributes";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: form.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save attribute");
      resetForm();
      fetchAttributes();
    } catch {
      alert("Failed to save attribute");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttribute(id: string) {
    if (!confirm("Delete this attribute? This will also remove all its values and variant assignments.")) return;
    try {
      const res = await fetch("/api/admin/attributes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchAttributes();
    } catch {
      alert("Failed to delete attribute");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Product Attributes</h1>
          <p className="mt-1 text-sm text-surface-500">Define global attributes like Size, Color, Flavour, Material, etc.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add Attribute
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            {editing ? "Edit Attribute" : "New Attribute"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Attribute ID *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  disabled={!!editing}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
                  placeholder="size"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Size"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Internal Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="size"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ProductAttribute["type"] })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="select">Select</option>
                  <option value="multiselect">Multi Select</option>
                  <option value="color">Color</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_variant}
                  onChange={(e) => setForm({ ...form, is_variant: e.target.checked })}
                  className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-surface-700">Creates Variants</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_required}
                  onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                  className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-surface-700">Required</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-surface-700">Active</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update Attribute" : "Create Attribute"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-surface-200 bg-white px-6 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : attributes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
          <p className="text-surface-500">No attributes yet. Create your first attribute above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className={`rounded-2xl border p-5 sm:p-6 ${
                attr.is_active ? "border-surface-200 bg-white" : "border-surface-300 bg-surface-50"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900">{attr.display_name}</h3>
                    <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500">{attr.name}</span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{attr.type}</span>
                    {attr.is_variant && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Variant</span>
                    )}
                    {!attr.is_active && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600">
                    Sort: {attr.sort_order} · {attr.is_required ? "Required" : "Optional"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(attr)}
                    className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAttribute(attr.id)}
                    className="rounded-lg border border-rose-200 bg-white p-2 text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
