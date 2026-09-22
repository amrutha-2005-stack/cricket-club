import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";
import { TournamentStatus } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1).optional(),
  year: z.number().int().optional().nullable(),
  location: z.string().optional(),
  description: z.string().optional(),
  winner: z.string().optional(),
  runnerUp: z.string().optional(),
  numberOfTeams: z.number().int().optional().nullable(),
  posterUrl: z.string().optional(),
  date: z.string().optional(),
  status: z.nativeEnum(TournamentStatus).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const { date, ...rest } = parsed.data;
  const tournament = await prisma.tournament.update({
    where: { id: params.id },
    data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
  });
  return NextResponse.json({ success: true, tournament });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.tournament.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.tournament.delete({ where: { id: params.id } });
  if (existing.posterUrl) await deleteFile(existing.posterUrl);

  return NextResponse.json({ success: true });
}
