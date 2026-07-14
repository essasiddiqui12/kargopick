"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  GripVertical,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url: string;
  desktop_image: string;
  mobile_image: string;
  sort_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_url: "",
    desktop_image: "",
    mobile_image: "",
    sort_order: 0,
    is_active: true,
    start_date: "",
    end_date: "",
  });

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setBanners(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function resetForm() {
    setForm({
      title: "",
      subtitle: "",
      cta_text: "",
      cta_url: "",
      desktop_image: "",
      mobile_image: "",
      sort_order: 0,
      is_active: true,
      start_date: "",
      end_date: "",
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(banner: Banner) {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      cta_text: banner.cta_text || "",
      cta_url: banner.cta_url,
      desktop_image: banner.desktop_image,
      mobile_image: banner.mobile_image,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.slice(0, 16) : "",
      end_date: banner.end_date ? banner.end_date.slice(0, 16) : "",
    });
    setEditing(banner);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? "/api/admin/banners" : "/api/admin/banners";
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save banner");
      resetForm();
      fetchBanners();
    } catch {
      alert("Failed to save banner");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(id: number) {
    if (!confirm("Delete this banner permanently?")) return;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchBanners();
    } catch {
      alert("Failed to delete banner");
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchBanners();
    } catch {
      alert("Failed to update banner");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Promotional Banners</h1>
          <p className="mt-1 text-sm text-surface-500">Manage homepage banners and promotions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            {editing ? "Edit Banner" : "New Banner"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Summer Sale 50% Off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Limited time offer on all proteins"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">CTA URL *</label>
                <input
                  type="text"
                  value={form.cta_url}
                  onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                  required
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="/products or https://..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Desktop Image URL *</label>
                <input
                  type="text"
                  value={form.desktop_image}
                  onChange={(e) => setForm({ ...form, desktop_image: e.target.value })}
                  required
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="https://..."
                />
                {form.desktop_image && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border border-surface-200">
                    <NextImage src={form.desktop_image} alt="Desktop preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Mobile Image URL *</label>
                <input
                  type="text"
                  value={form.mobile_image}
                  onChange={(e) => setForm({ ...form, mobile_image: e.target.value })}
                  required
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="https://..."
                />
                {form.mobile_image && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border border-surface-200">
                    <NextImage src={form.mobile_image} alt="Mobile preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Update Banner" : "Create Banner"}
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
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <ImageIcon className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No banners yet. Create your first promotional banner above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border p-5 sm:p-6 ${
                banner.is_active ? "border-surface-200 bg-white" : "border-surface-300 bg-surface-50"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical className="h-5 w-5 text-surface-300" />
                  <span className="text-xs font-mono text-surface-400">#{banner.sort_order}</span>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-lg border border-surface-200 bg-surface-100">
                    <NextImage src={banner.desktop_image} alt="Desktop" fill className="object-cover" />
                  </div>
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-lg border border-surface-200 bg-surface-100">
                    <NextImage src={banner.mobile_image} alt="Mobile" fill className="object-cover" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-900">{banner.title}</h3>
                    {banner.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-surface-400" />
                    )}
                    {banner.start_date || banner.end_date ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        <Calendar className="h-3 w-3" />
                        Scheduled
                      </span>
                    ) : null}
                  </div>
                  {banner.subtitle && <p className="text-sm text-surface-600 mb-1">{banner.subtitle}</p>}
                  <p className="text-xs text-surface-500">
                    CTA: {banner.cta_text || "No text"} → {banner.cta_url}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(banner.id, banner.is_active)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      banner.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-surface-200 bg-white text-surface-700 hover:bg-surface-50"
                    }`}
                  >
                    {banner.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => startEdit(banner)}
                    className="rounded-lg border border-surface-200 bg-white p-2 text-surface-700 hover:bg-surface-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
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
