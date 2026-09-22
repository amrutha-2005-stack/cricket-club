import { prisma } from "@/lib/db";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export default async function Videos() {
  const videos = await prisma.video.findMany({ orderBy: { order: "asc" }, take: 6 }).catch(() => []);

  return (
    <section id="videos" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">
          Videos
          <span className="mx-auto mt-2 block h-1 w-14 bg-brand-gold" />
        </h2>

        {videos.length === 0 ? (
          <div className="mx-auto mt-8 max-w-lg rounded-xl border border-dashed border-navy-950/15 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-950 text-brand-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
            </div>
            <p className="mt-4 font-display text-xl font-bold text-navy-950">Videos Coming Soon</p>
            <p className="mt-1 text-sm text-navy-950/50">Match highlights and tournament footage will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => {
              const ytId = getYouTubeId(v.youtubeUrl);
              return (
                <div key={v.id} className="reveal overflow-hidden rounded-xl border border-navy-950/10 shadow-sm">
                  <div className="aspect-video w-full bg-navy-900/5">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={v.title}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-bold text-navy-950">{v.title}</p>
                    {v.category && <p className="text-xs font-semibold uppercase text-navy-950/40">{v.category}</p>}
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
