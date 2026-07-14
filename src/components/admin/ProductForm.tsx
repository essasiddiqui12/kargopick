"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types";
import { categories } from "@/data/products";
import { Loader2 } from "lucide-react";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import VideoUploadField from "@/components/admin/VideoUploadField";
import { LowStockHint } from "@/components/admin/StockStatusBadge";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "protein" as Category,
  images: [] as string[],
  videos: [] as string[],
  badge: "",
  rating: "4.5",
  reviews: "0",
  stock: "10",
  inStock: true,
  weight: "",
  origin: "",
};

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm;
    return {
      name: initialData.name,
      description: initialData.description,
      price: String(initialData.price),
      originalPrice: initialData.originalPrice ? String(initialData.originalPrice) : "",
      category: initialData.category,
      images:
        initialData.images?.length > 0
          ? initialData.images
          : initialData.image
            ? [initialData.image]
            : [],
      videos: (initialData as Product & { videos?: string[] }).videos || [],
      badge: initialData.badge || "",
      rating: String(initialData.rating),
      reviews: String(initialData.reviews),
      stock: String(initialData.stock ?? (initialData.inStock ? 10 : 0)),
      inStock: initialData.inStock,
      weight: initialData.weight || "",
      origin: initialData.origin || "",
    };
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.images.length === 0) {
      setError("Please add at least one product image");
      setLoading(false);
      return;
    }

    const stock = Math.max(0, parseInt(form.stock, 10) || 0);

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      category: form.category,
      image: form.images[0],
      images: form.images,
      videos: form.videos,
      badge: form.badge || undefined,
      rating: parseFloat(form.rating),
      reviews: parseInt(form.reviews, 10),
      stock,
      inStock: stock > 0,
      weight: form.weight || undefined,
      origin: form.origin || undefined,
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${initialData!.id}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Product Name *</label>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Gold Standard Whey Protein"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description *</label>
          <textarea
            required
            rows={4}
            className={inputClass}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the product..."
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
            onChange={(e) => update("price", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Original Price (₹)</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.originalPrice}
            onChange={(e) => update("originalPrice", e.target.value)}
            placeholder="For showing discount"
          />
        </div>

        <div>
          <label className={labelClass}>Category *</label>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Badge</label>
          <input
            className={inputClass}
            value={form.badge}
            onChange={(e) => update("badge", e.target.value)}
            placeholder="Best Seller, Hot, Imported..."
          />
        </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>Product Images *</label>
        <MultiImageUploadField
          value={form.images}
          onChange={(urls) =>
            setForm((prev) => ({ ...prev, images: urls }))
          }
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>Product Videos (optional)</label>
        <VideoUploadField
          value={form.videos}
          onChange={(urls) =>
            setForm((prev) => ({ ...prev, videos: urls }))
          }
        />
        <p className="text-xs text-surface-400 mt-1">
          Supported formats: MP4, WebM. Max size: 50MB per video.
        </p>
      </div>

        <div>
          <label className={labelClass}>Weight / Size</label>
          <input
            className={inputClass}
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="2 kg, 30 servings..."
          />
        </div>

        <div>
          <label className={labelClass}>Origin</label>
          <input
            className={inputClass}
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
            placeholder="China, USA..."
          />
        </div>

        <div>
          <label className={labelClass}>Rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className={inputClass}
            value={form.rating}
            onChange={(e) => update("rating", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Reviews Count</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.reviews}
            onChange={(e) => update("reviews", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Stock Quantity *</label>
          <input
            required
            type="number"
            min="0"
            className={inputClass}
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            placeholder="Units available"
          />
          <LowStockHint />
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm text-surface-600">
            {parseInt(form.stock, 10) > 0 ? (
              <span className="text-emerald-600 font-medium">
                Product will be available for purchase
              </span>
            ) : (
              <span className="text-rose-600 font-medium">
                Product will be marked out of stock
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Update Product" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-surface-200 px-6 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
