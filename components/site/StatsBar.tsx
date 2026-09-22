import { prisma } from "@/lib/db";

const ICONS = {
  players: "M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-4.13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  trophy: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM7 4H3v2a4 4 0 0 0 4 4M17 4h4v2a4 4 0 0 1-4 4",
  photos: "M4 5h16v14H4zM4 15l4-4 4 4 4-6 4 4",
  calendar: "M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
};

export default async function StatsBar() {
  const [settings, playerCount, tournamentCount, photoCount] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.currentPlayer.count().catch(() => 0),
    prisma.tournament.count().catch(() => 0),
    prisma.galleryImage.count().catch(() => 0),
  ]);

  const formerCount = await prisma.formerPlayer.count().catch(() => 0);
  const totalPlayers = playerCount + formerCount;
  const foundedYear = settings?.foundedYear ?? 1994;

  const stats = [
    { icon: ICONS.players, value: totalPlayers > 0 ? `${totalPlayers}+` : "—", label: "Players & Members" },
    {
      icon: ICONS.trophy,
      value: (settings?.totalTournaments ?? tournamentCount) > 0 ? `${settings?.totalTournaments ?? tournamentCount}+` : "—",
      label: "Tournaments",
    },
    { icon: ICONS.photos, value: photoCount > 0 ? `${photoCount}+` : "—", label: "Photos & Memories" },
    { icon: ICONS.calendar, value: `Since ${foundedYear}`, label: "A Legacy Continues" },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6">
      <div className="reveal grid grid-cols-2 gap-6 rounded-xl bg-white px-6 py-8 shadow-premium sm:grid-cols-4 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold leading-none text-navy-950">{s.value}</p>
              <p className="text-xs text-navy-950/60">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
