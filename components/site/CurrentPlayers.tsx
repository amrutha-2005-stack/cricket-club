import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function CurrentPlayers() {
  const players = await prisma.currentPlayer.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <section id="current-players" className="bg-[#f4f5f7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">
          Current Squad
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>

        {players.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-navy-950/15 bg-white p-8 text-center text-sm text-navy-950/50">
            No current squad members added yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {players.map((p) => (
              <div key={p.id} className="reveal overflow-hidden rounded-xl bg-white text-center shadow-sm">
                <div className="relative aspect-square w-full bg-navy-900/5">
                  {p.photoUrl ? (
                    <Image src={p.photoUrl} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-navy-900/15">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                      </svg>
                    </div>
                  )}
                  {p.jerseyNumber != null && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-brand-gold">
                      {p.jerseyNumber}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-navy-950">{p.name}</p>
                  {p.role && <p className="text-[11px] font-semibold text-navy-950/50">{p.role}</p>}
                  {p.socialLink && (
                    <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] text-brand-golddark">
                      Follow →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
