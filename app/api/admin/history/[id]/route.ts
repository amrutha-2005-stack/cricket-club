import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(1).optional(),
  story: z.string().min(1).optional(),
  year: z.number().int().optional().nullable(),
  caption: z.string().optional(),
  additionalNotes: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const story = await prisma.historicalStory.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, story });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.historicalStory.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.historicalStory.delete({ where: { id: params.id } }); // cascades to images
  await Promise.all(existing.images.map((img) => deleteFile(img.url)));

  return NextResponse.json({ success: true });
}
