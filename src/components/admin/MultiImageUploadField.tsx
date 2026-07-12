"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, X, Star } from "lucide-react";

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function MultiImageUploadField({
  value,
  onChange,
  maxImages = 8,
}: MultiImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setError("");

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        urls.push(await uploadFile(file));
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function setAsCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [img] = next.splice(index, 1);
    next.unshift(img);
    onChange(next);
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (value.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    onChange([...value, url]);
    setUrlInput("");
    setError("");
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-surface-200">
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(index)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"
                    title="Set as cover"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
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
                Click to upload images
              </p>
              <p className="mt-1 text-xs text-surface-400">
                JPEG, PNG, WebP, GIF — max 5MB each · {value.length}/{maxImages}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          placeholder="Or paste image URL and press Add"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
        >
          Add
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <p className="text-xs text-surface-500">
        First image is the cover shown on product cards. Click the star to change cover.
      </p>
    </div>
  );
}
