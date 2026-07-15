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
  GripVertical,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    icon: "📦",
    image_url: "",
    sort_order: 0,
    is_active: true,
  });

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setCategories(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      description: "",
      icon: "📦",
      image_url: "",
      sort_order: 0,
      is_active: true,
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(cat: Category) {
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      image_url: cat.image_url || "",
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    });
    setEditing(cat);
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");

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
      if (!form.id || !form.name || !form.description) {
        alert("ID, name, and description are required");
        setSaving(false);
        return;
      }

      const url = "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: form.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save category");
      resetForm();
      fetchCategories();
    } catch {
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCategories();
    } catch {
      alert("Failed to delete category");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchCategories();
    } catch {
      alert("Failed to update category");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Categories</h1>
          <p className="mt-1 text-sm text-surface-500">Manage homepage category cards</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            {editing ? "Edit Category" : "New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category ID *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  disabled={!!editing}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
                  placeholder="gym-essentials"
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
              <label className="block text-sm font-medium text-surface-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Short description for the category card"
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
              <label className="block text-sm font-medium text-surface-700 mb-1">Category Image (optional)</label>
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
                  <img src={form.image_url} alt="Category preview" className="h-full w-full object-cover" />
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update Category" : "Create Category"}
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
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <ImageIcon className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No categories yet. Create your first category above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl border p-5 sm:p-6 ${
                cat.is_active ? "border-surface-200 bg-white" : "border-surface-300 bg-surface-50"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical className="h-5 w-5 text-surface-300" />
                  <span className="text-xs font-mono text-surface-400">#{cat.sort_order}</span>
                </div>

                <div className="flex-shrink-0">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border border-surface-200 bg-surface-100 flex items-center justify-center text-3xl">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{cat.icon}</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900">{cat.name}</h3>
                    {cat.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-surface-400" />
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mb-1">{cat.description}</p>
                  <p className="text-xs text-surface-500">
                    ID: {cat.id} · Icon: {cat.icon}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(cat.id, cat.is_active)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      cat.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-surface-200 bg-white text-surface-700 hover:bg-surface-50"
                    }`}
                  >
                    {cat.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
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
