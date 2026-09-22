import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Footer() {
  const [settings, socials] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.socialLink.findMany().catch(() => []),
  ]);

  const socialMap = Object.fromEntries(socials.filter((s) => s.url).map((s) => [s.platform, s.url]));

  return (
    <footer className="bg-[#050914] py-12 text-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Image src="/images/logo.jpg" alt="Bengaluru Friends logo" width={48} height={50} className="h-12 w-auto rounded" />
            <p className="mt-4 font-display text-lg font-bold text-white">BENGALURU FRIENDS</p>
            <p className="text-xs text-brand-gold">SINCE {settings?.foundedYear ?? 1994}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/40">Quick Links</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {[
                ["About", "#about"],
                ["Achievements", "#achievements"],
                ["Tournaments", "#tournaments"],
                ["Gallery", "/gallery"],
                ["Videos", "#videos"],
                ["Players", "#current-players"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/40">Follow</p>
            <div className="mt-3 flex gap-3">
              {Object.entries(socialMap).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold hover:text-navy-950 transition-colors"
                >
                  {platform[0]}
                </a>
              ))}
              {Object.keys(socialMap).length === 0 && <p className="text-xs">Social links coming soon.</p>}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Bengaluru Friends. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
