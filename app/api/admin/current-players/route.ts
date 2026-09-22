import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  photoUrl: z.string().optional(),
  jerseyNumber: z.number().int().optional().nullable(),
  role: z.string().optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  bio: z.string().optional(),
  socialLink: z.string().optional(),
});

export async function GET() {
  const players = await prisma.currentPlayer.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ players });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const maxOrder = await prisma.currentPlayer.aggregate({ _max: { order: true } });
  const player = await prisma.currentPlayer.create({ data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 } });
  return NextResponse.json({ success: true, player });
}
