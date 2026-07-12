"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploadField({
  value,
  onChange,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-surface-200">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-8 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-surface-400" />
            <p className="mt-2 text-sm font-medium text-surface-600">
              Click to upload image
            </p>
            <p className="mt-1 text-xs text-surface-400">
              JPEG, PNG, WebP, GIF — max 5MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-500 mb-1">
          Or paste image URL
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          placeholder="/uploads/products/... or https://..."
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
