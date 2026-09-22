"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Story = { id: string; title: string; story: string; year: number | null; images: { id: string; url: string }[] };

export default function HistoryAdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("A Historic Chapter");
  const [story, setStory] = useState("");
  const [year, setYear] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/history");
    const data = await res.json();
    setStories(data.stories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        story,
        year: year ? parseInt(year, 10) : null,
        caption: caption || undefined,
        imageUrls: images.filter(Boolean),
      }),
    });
    setTitle("A Historic Chapter");
    setStory("");
    setYear("");
    setCaption("");
    setImages(["", "", "", ""]);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this story? This cannot be undone.")) return;
    await fetch(`/api/admin/history/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Sri Lanka Story</h1>
      <p className="mt-1 text-sm text-navy-950/50">
        Historical content as recorded by the club — presented as told, not independently verified.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((url, i) => (
            <ImageUploadField
              key={i}
              label={`Photo / Document ${i + 1}`}
              value={url}
              onChange={(newUrl) => setImages((imgs) => imgs.map((v, idx) => (idx === i ? newUrl : v)))}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Story *</label>
          <textarea required rows={6} value={story} onChange={(e) => setStory(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Caption</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>

        <button type="submit" disabled={saving} className="mt-5 rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {saving ? "Saving…" : "Add Story"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-navy-950/50">Loading…</p>
        ) : stories.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-navy-950/50 shadow-sm">No stories added yet.</p>
        ) : (
          stories.map((s) => (
            <div key={s.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
              <div>
                <p className="font-bold text-navy-950">{s.title} {s.year ? `· ${s.year}` : ""}</p>
                <p className="mt-1 line-clamp-2 text-sm text-navy-950/60">{s.story}</p>
                <p className="mt-1 text-xs text-navy-950/40">{s.images.length} image(s)</p>
              </div>
              <button onClick={() => handleDelete(s.id)} className="shrink-0 rounded border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
