import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { TournamentStatus } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  year: z.number().int().optional().nullable(),
  location: z.string().optional(),
  description: z.string().optional(),
  winner: z.string().optional(),
  runnerUp: z.string().optional(),
  numberOfTeams: z.number().int().optional().nullable(),
  posterUrl: z.string().optional(),
  date: z.string().optional(),
  status: z.nativeEnum(TournamentStatus).optional(),
});

export async function GET() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ tournaments });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const { date, ...rest } = parsed.data;
  const maxOrder = await prisma.tournament.aggregate({ _max: { order: true } });

  const tournament = await prisma.tournament.create({
    data: { ...rest, date: date ? new Date(date) : undefined, order: (maxOrder._max.order ?? -1) + 1 },
  });
  return NextResponse.json({ success: true, tournament });
}
