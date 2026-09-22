import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(1).optional(),
  tournamentName: z.string().optional(),
  year: z.number().int().optional().nullable(),
  description: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const album = await prisma.galleryAlbum.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!album) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ album });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const album = await prisma.galleryAlbum.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, album });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const album = await prisma.galleryAlbum.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!album) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.galleryAlbum.delete({ where: { id: params.id } }); // cascades to images
  await Promise.all(album.images.map((img) => deleteFile(img.url)));

  return NextResponse.json({ success: true });
}
