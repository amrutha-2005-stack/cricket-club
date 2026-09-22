import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

const VALUES = [
  { label: "Friendship", icon: "M8.5 14.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7-2.5 2-2M13 15l3 3 5-5" },
  { label: "Sportsmanship", icon: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 4H3v2a4 4 0 0 0 4 4M17 4h4v2a4 4 0 0 1-4 4" },
  { label: "Teamwork", icon: "M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-4.13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { label: "Beyond Boundaries", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" },
];

export default async function Hero() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);

  return (
    <section id="home" className="relative overflow-hidden bg-black text-white">
      {/* hero-1.jpg already contains the crest, "Since 1994" and the "Cricket Brings Us
          Together" slogan baked into the artwork — no text is overlaid on top of it here,
          per instruction, to avoid duplicating what's already in the image. */}
      <div className="relative aspect-[2560/853] w-full sm:aspect-[2560/853]">
        <Image src="/images/hero-1.jpg" alt="Bengaluru Friends — Since 1994 — Cricket Brings Us Together" fill priority className="object-cover" />
      </div>

      {/* Supporting content below the banner: intro copy, CTAs, and the values list */}
      <div className="relative border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="reveal mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <p className="text-white/80">
                {settings?.tagline ||
                  "Bengaluru Friends (R) is a cricket club built on friendship, passion and the love for the game — creating memories on and off the field."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href="#history"
                  className="inline-flex items-center gap-2 rounded-md bg-brand-gold px-6 py-3 text-sm font-bold text-white hover:bg-brand-golddark transition-colors"
                >
                  Our Journey
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link
                  href="#videos"
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                  Watch Video
                </Link>
              </div>
            </div>

            <div className="reveal mx-auto flex flex-col items-center gap-4 text-center lg:mx-0 lg:items-start lg:text-left">
              <p className="text-xs font-bold tracking-[3px] text-white/50">CRICKET UNITES US</p>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                {VALUES.map((v) => (
                  <div key={v.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 text-brand-gold">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d={v.icon} />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-white/90">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
