"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { categories } from "@/data/products";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  parent_category: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    parent_category: categories[0]?.id || "",
    icon: "📦",
    image_url: "",
    sort_order: 0,
    is_active: true,
  });

  async function fetchSubcategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subcategories");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setSubcategories(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubcategories();
  }, []);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      description: "",
      parent_category: categories[0]?.id || "",
      icon: "📦",
      image_url: "",
      sort_order: 0,
      is_active: true,
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(sub: Subcategory) {
    setForm({
      id: sub.id,
      name: sub.name,
      description: sub.description,
      parent_category: sub.parent_category,
      icon: sub.icon,
      image_url: sub.image_url || "",
      sort_order: sub.sort_order,
      is_active: sub.is_active,
    });
    setEditing(sub);
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "subcategories");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm({ ...form, image_url: data.url });
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.id || !form.name || !form.parent_category) {
        alert("ID, name, and parent category are required");
        setSaving(false);
        return;
      }

      const url = "/api/admin/subcategories";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: form.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save subcategory");
      resetForm();
      fetchSubcategories();
    } catch {
      alert("Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubcategory(id: string) {
    if (!confirm("Delete this subcategory permanently?")) return;
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchSubcategories();
    } catch {
      alert("Failed to delete subcategory");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchSubcategories();
    } catch {
      alert("Failed to update subcategory");
    }
  }

  const getParentName = (parentId: string) => {
    return categories.find((c) => c.id === parentId)?.name || parentId;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Subcategories</h1>
          <p className="mt-1 text-sm text-surface-500">Manage subcategories under each main category</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add Subcategory
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            {editing ? "Edit Subcategory" : "New Subcategory"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Subcategory ID *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  disabled={!!editing}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
                  placeholder="whey-protein"
                />
                <p className="text-xs text-surface-400 mt-1">Used in URLs. Lowercase, hyphens only.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Whey Protein"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Parent Category *</label>
              <select
                value={form.parent_category}
                onChange={(e) => setForm({ ...form, parent_category: e.target.value })}
                disabled={!!editing}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Short description for the subcategory"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="💪"
                />
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
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Subcategory Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mb-2 block w-full text-sm text-surface-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
              {form.image_url && (
                <div className="mt-3 relative h-32 w-full overflow-hidden rounded-lg border border-surface-200">
                  <img src={form.image_url} alt="Subcategory preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-surface-700">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update Subcategory" : "Create Subcategory"}
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
      ) : subcategories.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <ImageIcon className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No subcategories yet. Create your first subcategory above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subcategories.map((sub) => (
            <div
              key={sub.id}
              className={`rounded-2xl border p-5 sm:p-6 ${
                sub.is_active ? "border-surface-200 bg-white" : "border-surface-300 bg-surface-50"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-xs font-mono text-surface-400">#{sub.sort_order}</span>
                </div>

                <div className="flex-shrink-0">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border border-surface-200 bg-surface-100 flex items-center justify-center text-3xl">
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{sub.icon}</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900">{sub.name}</h3>
                    {sub.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-surface-400" />
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mb-1">{sub.description}</p>
                  <p className="text-xs text-surface-500">
                    Parent: {getParentName(sub.parent_category)} · ID: {sub.id}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(sub.id, sub.is_active)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      sub.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-surface-200 bg-white text-surface-700 hover:bg-surface-50"
                    }`}
                  >
                    {sub.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => startEdit(sub)}
                    className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSubcategory(sub.id)}
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
