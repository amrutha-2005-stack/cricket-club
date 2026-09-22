import Link from "next/link";
import { prisma } from "@/lib/db";

function formatEventDate(date: Date) {
  return {
    month: date.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString(undefined, { day: "2-digit" }),
  };
}

export default async function AboutEventsNews() {
  const [settings, events, news] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.eventItem.findMany({ where: { eventDate: { gte: new Date() } }, orderBy: { eventDate: "asc" }, take: 3 }).catch(() => []),
    prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }).catch(() => []),
  ]);

  return (
    <section id="about" className="bg-[#f4f5f7] py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3">
        {/* About */}
        <div className="reveal">
          <h2 className="font-display text-2xl font-extrabold text-navy-950">
            About Us
            <span className="mt-1 block h-1 w-10 bg-brand-gold" />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-950/70">
            {settings?.aboutText ||
              "Bengaluru Friends (R) is a community of cricket lovers who came together with a shared passion for the game. We believe in sportsmanship, teamwork and lifelong friendships."}
          </p>
          <Link
            href="#history"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 transition-colors"
          >
            Know More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Upcoming Events */}
        <div className="reveal">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold text-navy-950">
              Upcoming Events
              <span className="mt-1 block h-1 w-10 bg-brand-gold" />
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="rounded-md border border-dashed border-navy-950/15 bg-white p-4 text-sm text-navy-950/50">
                No upcoming events yet.
              </p>
            ) : (
              events.map((event) => {
                const { month, day } = formatEventDate(event.eventDate);
                return (
                  <div key={event.id} className="flex items-center gap-4 rounded-md bg-white p-3 shadow-sm">
                    <div className="flex w-12 shrink-0 flex-col items-center leading-none text-navy-900">
                      <span className="text-[10px] font-bold tracking-wide">{month}</span>
                      <span className="font-display text-xl font-extrabold">{day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-950">{event.title}</p>
                      {event.location && <p className="text-xs text-navy-950/50">{event.location}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Latest News */}
        <div className="reveal">
          <h2 className="font-display text-2xl font-extrabold text-navy-950">
            Latest News
            <span className="mt-1 block h-1 w-10 bg-brand-gold" />
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {news.length === 0 ? (
              <p className="rounded-md border border-dashed border-navy-950/15 bg-white p-4 text-sm text-navy-950/50">
                No news posted yet.
              </p>
            ) : (
              news.map((post) => (
                <div key={post.id} className="flex items-center gap-3 rounded-md bg-white p-2 shadow-sm">
                  <div
                    className="h-12 w-14 shrink-0 rounded bg-navy-900/10 bg-cover bg-center"
                    style={post.imageUrl ? { backgroundImage: `url(${post.imageUrl})` } : undefined}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-950">{post.title}</p>
                    <p className="text-xs text-navy-950/50">
                      {post.publishedAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
