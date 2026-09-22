import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">
        Contact Messages
      </h1>

      <p className="mt-1 text-sm text-navy-950/50">
        Messages submitted through the website contact form.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-navy-950/50">
            No messages yet.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-navy-950">
                  {m.name}{" "}
                  <span className="font-normal text-navy-950/50">
                    · {m.email}
                  </span>
                </p>

                <p className="text-xs text-navy-950/40">
                  {m.createdAt.toLocaleString()}
                </p>
              </div>

              {m.phone && (
                <p className="mt-1 text-xs text-navy-950/50">
                  {m.phone}
                </p>
              )}

              <p className="mt-3 text-sm text-navy-950/80">
                {m.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
