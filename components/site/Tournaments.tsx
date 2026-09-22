import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function Tournaments() {
  const tournaments = await prisma.tournament
    .findMany({ orderBy: { order: "asc" }, include: { photos: { take: 1 } } })
    .catch(() => []);

  return (
    <section id="tournaments" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">
          Tournaments Organized
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>

        {tournaments.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-navy-950/15 p-8 text-center text-sm text-navy-950/50">
            No tournaments added yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const cover = t.posterUrl || t.photos[0]?.url;
              return (
                <div key={t.id} className="reveal overflow-hidden rounded-xl border border-navy-950/10 shadow-sm">
                  <div className="relative h-40 w-full bg-navy-900/5">
                    {cover ? (
                      <Image src={cover} alt={t.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-navy-900/15">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded bg-navy-950/80 px-2 py-1 text-[10px] font-bold uppercase text-white">
                      {t.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-bold text-navy-950">
                      {t.name} {t.year ? <span className="text-navy-950/40">· {t.year}</span> : null}
                    </p>
                    {t.location && <p className="text-xs text-navy-950/50">{t.location}</p>}
                    {(t.winner || t.runnerUp) && (
                      <p className="mt-2 text-xs text-navy-950/70">
                        {t.winner && <>🏆 {t.winner}</>} {t.runnerUp && <> · 🥈 {t.runnerUp}</>}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
