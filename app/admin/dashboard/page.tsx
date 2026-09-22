import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [albums, founders, tournaments, messages] = await Promise.all([
    prisma.galleryAlbum.findMany({
      include: {
        images: true,
      },
      orderBy: {
        order: "asc",
      },
    }),
    prisma.founder.findMany(),
    prisma.tournament.findMany(),
    prisma.contactMessage.findMany(),
  ]);

 const totalImages = albums.reduce(
  (total: number, album: { images: unknown[] }) =>
    total + album.images.length,
  0
);

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-950">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage Bengaluru Friends website content.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Gallery Albums</p>
            <p className="mt-2 text-3xl font-bold">{albums.length}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Gallery Images</p>
            <p className="mt-2 text-3xl font-bold">{totalImages}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Founders</p>
            <p className="mt-2 text-3xl font-bold">{founders.length}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Tournaments</p>
            <p className="mt-2 text-3xl font-bold">{tournaments.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/dashboard/gallery"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-navy-950">
              Gallery Management
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Upload and manage tournament and memory photos.
            </p>
          </Link>

          <Link
            href="/admin/dashboard/founders"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-navy-950">
              Founders & Leadership
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Manage founder and leadership profiles.
            </p>
          </Link>

          <Link
            href="/admin/dashboard/tournaments"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-navy-950">
              Tournaments
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Manage tournaments and championships.
            </p>
          </Link>

          <Link
            href="/admin/dashboard/messages"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-navy-950">
              Contact Messages
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              View messages submitted through the website.
            </p>
            <p className="mt-3 text-sm font-semibold">
              {messages.length} message(s)
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}