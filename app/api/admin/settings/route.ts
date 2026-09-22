import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  siteTitle: z.string().min(1).optional(),
  metaDescription: z.string().optional(),
  tagline: z.string().optional(),
  topBarTagline: z.string().optional(),
  bannerQuote: z.string().optional(),
  foundedYear: z.number().int().optional(),
  totalTournaments: z.number().int().optional().nullable(),
  totalChampionships: z.number().int().optional().nullable(),
  aboutText: z.string().optional(),
  missionText: z.string().optional(),
  communityText: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  mapUrl: z.string().optional(),
});

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  return NextResponse.json({ success: true, settings });
}
