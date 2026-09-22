"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImageItem = {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  albumTitle: string;
};

export default function GalleryGrid({ images }: { images: GalleryImageItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? images[activeIndex] : null;

  function step(direction: 1 | -1) {
    if (activeIndex === null) return;
    const next = (activeIndex + direction + images.length) % images.length;
    setActiveIndex(next);
  }

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className="block w-full overflow-hidden rounded-lg bg-navy-900/5"
          >
            <Image
              src={img.url}
              alt={img.altText || img.albumTitle}
              width={500}
              height={500}
              className="w-full transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4" onClick={() => setActiveIndex(null)}>
          <button className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-brand-gold hover:text-navy-950" onClick={() => setActiveIndex(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <button className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-brand-gold hover:text-navy-950" onClick={(e) => { e.stopPropagation(); step(-1); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[85vh] max-w-[90vw]">
            <Image src={active.url} alt={active.altText || active.albumTitle} width={1200} height={1200} className="max-h-[85vh] w-auto rounded" />
            <p className="mt-3 text-center text-sm text-white/60">{active.caption || active.albumTitle}</p>
          </div>
          <button className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-brand-gold hover:text-navy-950" onClick={(e) => { e.stopPropagation(); step(1); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
