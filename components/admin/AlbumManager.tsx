"use client";

import { useEffect, useState, useRef } from "react";


type GalleryImageItem = { id: string; url: string };
type Album = { id: string; title: string; images: GalleryImageItem[] };

export default function AlbumManager({ albumId }: { albumId: string }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/gallery/albums/${albumId}`);
    const data = await res.json();
    setAlbum(data.album || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [albumId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setUploading(true);
    setProgress({ done: 0, total: fileArray.length });

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error);

        await fetch("/api/admin/gallery/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId, url: uploadData.url }),
        });
      } catch (err) {
        console.error("Upload failed for", file.name, err);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    load();
  }

  async function handleDeleteImage(id: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/gallery/images/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-navy-950/50">Loadingâ€¦</p>;
  if (!album) return <p className="text-sm text-navy-950/50">Album not found.</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">{album.title}</h1>
      <p className="mt-1 text-sm text-navy-950/50">{album.images.length} photo{album.images.length === 1 ? "" : "s"}</p>

      <div className="mt-6 rounded-xl border-2 border-dashed border-navy-950/15 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-navy-950">Upload photos to this album</p>
        <p className="mt-1 text-xs text-navy-950/50">JPG, PNG or WEBP. You can select many at once.</p>
        <label className="mt-4 inline-block cursor-pointer rounded-md bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800">
          {uploading ? `Uploading ${progress.done}/${progress.total}â€¦` : "Choose Photos"}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={uploading} onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {album.images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md bg-navy-900/5">
            <img src={img.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <button
              onClick={() => handleDeleteImage(img.id)}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Delete photo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

