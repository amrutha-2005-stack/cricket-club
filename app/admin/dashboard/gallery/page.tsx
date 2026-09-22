"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Album = { id: string; title: string; year: number | null; _count: { images: number } };

export default function GalleryAlbumsAdminPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery/albums");
    const data = await res.json();
    setAlbums(data.albums || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/admin/gallery/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, year: year ? parseInt(year, 10) : null }),
    });
    setTitle("");
    setYear("");
    setCreating(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this album and all its photos? This cannot be undone.")) return;
    await fetch(`/api/admin/gallery/albums/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Winner Gallery — Albums</h1>

      <form onSubmit={handleCreate} className="mt-6 flex max-w-xl gap-3 rounded-xl bg-white p-5 shadow-sm">
        <input required placeholder="Album title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        <input placeholder="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-28 rounded-md border border-navy-950/15 px-3 py-2.5 text-sm outline-none focus:border-brand-gold" />
        <button type="submit" disabled={creating} className="rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60">
          {creating ? "Creating…" : "Create Album"}
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-navy-950/50">Loading…</p>
        ) : albums.length === 0 ? (
          <p className="text-sm text-navy-950/50">No albums created yet.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="font-display text-xl font-bold text-navy-950">{album.title}</p>
              <p className="text-xs text-navy-950/40">{album.year ?? "—"} · {album._count.images} photo{album._count.images === 1 ? "" : "s"}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/dashboard/gallery/${album.id}`} className="rounded border border-navy-950/15 px-3 py-1.5 text-sm font-semibold hover:bg-navy-950/5">
                  Manage Photos
                </Link>
                <button onClick={() => handleDelete(album.id)} className="rounded border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
