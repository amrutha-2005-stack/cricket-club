import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(1).optional(),
  photoUrl: z.string().optional(),
  jerseyNumber: z.number().int().optional().nullable(),
  role: z.string().optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  bio: z.string().optional(),
  socialLink: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const player = await prisma.currentPlayer.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, player });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.currentPlayer.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.currentPlayer.delete({ where: { id: params.id } });
  if (existing.photoUrl) await deleteFile(existing.photoUrl);

  return NextResponse.json({ success: true });
}
