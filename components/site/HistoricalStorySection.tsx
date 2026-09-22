import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function HistoricalStorySection() {
  const stories = await prisma.historicalStory
    .findMany({ orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } })
    .catch(() => []);

  return (
    <section id="history" className="bg-navy-950 py-16 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold">
          A Historic Chapter
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-xs text-white/40">
          As recorded in the club&rsquo;s own history — presented here as told, not independently verified.
        </p>

        {stories.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            No historical stories added yet.
          </p>
        ) : (
          <div className="mt-10 flex flex-col gap-10">
            {stories.map((s) => (
              <div key={s.id} className="reveal grid gap-6 rounded-xl bg-navy-900 p-6 sm:grid-cols-[1fr_1.2fr] sm:p-8">
                <div className="flex flex-col gap-3">
                  {s.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {s.images.slice(0, 4).map((img) => (
                        <div key={img.id} className="relative aspect-square overflow-hidden rounded-md bg-navy-800">
                          <Image src={img.url} alt={img.caption || s.title} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-md bg-navy-800 text-white/15">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  {s.year && <p className="text-xs font-bold tracking-wide text-brand-gold">{s.year}</p>}
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/80">{s.story}</p>
                  {s.caption && <p className="mt-3 text-xs italic text-white/40">{s.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
