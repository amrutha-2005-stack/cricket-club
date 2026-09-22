import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  tournamentName: z.string().optional(),
  year: z.number().int().optional().nullable(),
  description: z.string().optional(),
});

export async function GET() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { images: true } } },
  });
  return NextResponse.json({ albums });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const maxOrder = await prisma.galleryAlbum.aggregate({ _max: { order: true } });
  const album = await prisma.galleryAlbum.create({ data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 } });
  return NextResponse.json({ success: true, album });
}
