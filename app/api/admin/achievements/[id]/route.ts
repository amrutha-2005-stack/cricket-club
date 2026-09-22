import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  year: z.number().int().optional().nullable(),
  tournamentName: z.string().optional(),
  trophyImageUrl: z.string().optional(),
  teamPhotoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const achievement = await prisma.achievement.findUnique({ where: { id: params.id } });
  if (!achievement) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ achievement });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const achievement = await prisma.achievement.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, achievement });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.achievement.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.achievement.delete({ where: { id: params.id } });

  if (existing.trophyImageUrl) await deleteFile(existing.trophyImageUrl);
  if (existing.teamPhotoUrl) await deleteFile(existing.teamPhotoUrl);

  return NextResponse.json({ success: true });
}
