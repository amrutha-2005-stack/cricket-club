"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

export default function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-navy-900/5">
          {value ? (
            <Image src={value} alt={label} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-navy-900/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <label className="inline-block cursor-pointer rounded-md border border-navy-950/15 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="ml-2 text-sm font-semibold text-red-600 hover:underline">
              Remove
            </button>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
