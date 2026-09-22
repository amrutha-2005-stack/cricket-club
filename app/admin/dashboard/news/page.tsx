"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";

type NewsItem = { id: string; title: string; summary: string | null; imageUrl: string | null; publishedAt: string };

export default function NewsAdminPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/news");
    const data = await res.json();
    setItems(data.news || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSummary("");
    setImageUrl("");
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setSummary(item.summary || "");
    setImageUrl(item.imageUrl || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { title, summary: summary || undefined, imageUrl: imageUrl || undefined };

    await fetch(editingId ? `/api/admin/news/${editingId}` : "/api/admin/news", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this news post?")) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Latest News</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-navy-950">{editingId ? "Edit Post" : "Add Post"}</p>
        <ImageUploadField label="Image" value={imageUrl} onChange={setImageUrl} />
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-950/50">Summary</label>
          <textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
            {saving ? "Saving…" : editingId ? "Save Changes" : "Add Post"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-md border border-navy-950/15 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-navy-950/5">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-navy-950/50">Loading…</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-navy-950/50 shadow-sm">No news posted yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-navy-950">{item.title}</p>
                <p className="text-xs text-navy-950/40">{new Date(item.publishedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="rounded border border-navy-950/15 px-3 py-1 text-sm font-semibold hover:bg-navy-950/5">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="rounded border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
