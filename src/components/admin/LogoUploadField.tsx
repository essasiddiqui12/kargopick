"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";

interface LogoUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export default function LogoUploadField({
  value,
  onChange,
  disabled = false,
}: LogoUploadFieldProps) {
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

      const res = await fetch("/api/admin/upload/logo", {
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

  async function handleRemove() {
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove logo");

      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove logo");
    }
  }

  return (
    <div className="space-y-4">
      {value && (
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-surface-200 bg-white">
            <Image
              src={value}
              alt="Store logo preview"
              fill
              className="object-contain p-2"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <X className="h-4 w-4" />
            Remove logo
          </button>
        </div>
      )}

      <div
        onClick={() => !uploading && !disabled && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-10 transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-brand-300 hover:bg-brand-50/50"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-surface-400" />
            <p className="mt-2 text-sm font-medium text-surface-700">
              {value ? "Upload a new logo" : "Upload your store logo"}
            </p>
            <p className="mt-1 text-xs text-surface-400">
              PNG with transparent background works best · max 5MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
