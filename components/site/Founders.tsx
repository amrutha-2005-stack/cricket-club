import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function Founders() {
  const founders = await prisma.founder.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <section id="leadership" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">
          Founder &amp; Leadership
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>

        {founders.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-navy-950/15 p-8 text-center text-sm text-navy-950/50">
            Leadership profiles have not been added yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((f) => (
              <div key={f.id} className="reveal overflow-hidden rounded-xl bg-navy-950 text-white shadow-premium">
                <div className="relative h-64 w-full bg-navy-800">
                  {f.photoUrl ? (
                    <img src={f.photoUrl} alt={f.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-display text-xl font-bold">{f.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{f.designation}</p>
                  {f.message && <p className="mt-3 text-sm italic text-white/70">&ldquo;{f.message}&rdquo;</p>}
                  {f.bio && <p className="mt-2 text-sm text-white/60 line-clamp-4">{f.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

