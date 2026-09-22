import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function Achievements() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <section id="achievements" className="bg-[#f4f5f7] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">
          Achievements
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>

        {achievements.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-navy-950/15 bg-white p-8 text-center text-sm text-navy-950/50">
            No achievements added yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <div key={a.id} className="reveal overflow-hidden rounded-xl bg-white shadow-premium">
                <div className="relative h-44 w-full bg-navy-900/5">
                  {a.trophyImageUrl || a.teamPhotoUrl ? (
                    <Image src={(a.trophyImageUrl || a.teamPhotoUrl)!} alt={a.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-navy-900/15">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 4H3v2a4 4 0 0 0 4 4M17 4h4v2a4 4 0 0 1-4 4" />
                      </svg>
                    </div>
                  )}
                  {a.year && (
                    <span className="absolute right-3 top-3 rounded bg-brand-gold px-2 py-1 text-xs font-bold text-navy-950">
                      {a.year}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-bold text-navy-950">{a.title}</p>
                  {a.tournamentName && <p className="text-xs font-semibold text-navy-950/50">{a.tournamentName}</p>}
                  {a.description && <p className="mt-2 text-sm text-navy-950/70 line-clamp-3">{a.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
