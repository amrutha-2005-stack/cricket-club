"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type VideoFormValues = {
  title: string;
  youtubeUrl: string;
  description: string;
  year: string;
  tournamentName: string;
  category: string;
};

const EMPTY: VideoFormValues = { title: "", youtubeUrl: "", description: "", year: "", tournamentName: "", category: "" };

export default function VideoForm({ videoId, initialValues }: { videoId?: string; initialValues?: Partial<VideoFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<VideoFormValues>({ ...EMPTY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof VideoFormValues>(key: K, value: VideoFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: values.title,
      youtubeUrl: values.youtubeUrl,
      description: values.description || undefined,
      year: values.year ? parseInt(values.year, 10) : null,
      tournamentName: values.tournamentName || undefined,
      category: values.category || undefined,
    };

    try {
      const res = await fetch(videoId ? `/api/admin/videos/${videoId}` : "/api/admin/videos", {
        method: videoId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      router.push("/admin/dashboard/videos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Title *</label>
        <input required value={values.title} onChange={(e) => set("title", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">YouTube URL *</label>
        <input required value={values.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Year</label>
          <input type="number" value={values.year} onChange={(e) => set("year", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Tournament</label>
          <input value={values.tournamentName} onChange={(e) => set("tournamentName", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Category</label>
          <input value={values.category} onChange={(e) => set("category", e.target.value)} placeholder="Highlights, Training…" className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Description</label>
        <textarea rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : videoId ? "Save Changes" : "Add Video"}
        </button>
        <button type="button" onClick={() => router.push("/admin/dashboard/videos")} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
