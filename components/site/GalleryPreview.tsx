import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function GalleryPreview() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { album: true },
  }).catch(() => []);

  return (
    <section id="gallery" className="bg-[#f4f5f7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold text-navy-950">
            Winner Gallery
            <span className="mt-2 block h-1 w-14 bg-brand-gold" />
          </h2>
          <Link href="/gallery" className="text-sm font-bold text-navy-900 hover:text-brand-golddark">
            View Full Gallery →
          </Link>
        </div>

        {images.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-navy-950/15 bg-white p-8 text-center text-sm text-navy-950/50">
            No gallery images available yet.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <Link key={img.id} href="/gallery" className="reveal relative aspect-square overflow-hidden rounded-lg bg-navy-900/5">
                <Image src={img.url} alt={img.altText || img.album.title} fill className="object-cover transition-transform duration-500 hover:scale-105" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
