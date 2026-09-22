import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  year: z.number().int().optional().nullable(),
  tournamentName: z.string().optional(),
  trophyImageUrl: z.string().optional(),
  teamPhotoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function GET() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ achievements });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const maxOrder = await prisma.achievement.aggregate({ _max: { order: true } });

  const achievement = await prisma.achievement.create({
    data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 },
  });

  return NextResponse.json({ success: true, achievement });
}
