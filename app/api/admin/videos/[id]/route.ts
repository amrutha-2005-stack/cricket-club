import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1).optional(),
  youtubeUrl: z.string().min(1).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  year: z.number().int().optional().nullable(),
  tournamentName: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const video = await prisma.video.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, video });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  await prisma.video.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
