"use client";

import { useState, useCallback } from "react";
import { Loader2, X, Play } from "lucide-react";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const MAX_SIZE = 50 * 1024 * 1024;

export default function VideoUploadField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only MP4, WebM, and OGG videos are allowed");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Video size must be under 50MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "videos");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange([...value, data.url]);
    } catch {
      setError("Failed to upload video");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [onChange, value]);

  function removeVideo(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        onChange={handleUpload}
        disabled={uploading}
        className="mb-2 block w-full text-sm text-surface-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50"
      />
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading video...
        </div>
      )}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-2"
            >
              <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-200">
                <video
                  src={url}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-700 truncate">
                  Video {index + 1}
                </p>
                <p className="text-xs text-surface-400 truncate">{url}</p>
              </div>
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
