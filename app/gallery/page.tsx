import { prisma } from "@/lib/db";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import GalleryGrid from "@/components/site/GalleryGrid";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [albums, socials] = await Promise.all([
    prisma.galleryAlbum.findMany({
      orderBy: { order: "asc" },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.socialLink.findMany().catch(() => []),
  ]);

  const socialLinks = Object.fromEntries(
    socials
      .filter((s) => s.url)
      .map((s) => [s.platform, s.url])
  );

  const allImages = albums.flatMap((album) =>
    album.images.map((image) => ({
      ...image,
      albumTitle: album.title,
    }))
  );

  return (
    <>
      <Navbar socialLinks={socialLinks} />

      <section className="bg-navy-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-4xl font-extrabold">
            Winner Gallery
          </h1>
          <p className="mt-2 text-white/50">
            Matches, tournaments, trophies and memories from over the years.
          </p>
        </div>
      </section>

      <section className="bg-[#f4f5f7] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {allImages.length === 0 ? (
            <p className="rounded-md border border-dashed border-navy-950/15 bg-white p-10 text-center text-sm text-navy-950/50">
              No gallery images available yet.
            </p>
          ) : (
            <GalleryGrid images={allImages} />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
