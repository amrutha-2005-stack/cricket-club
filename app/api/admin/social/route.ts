import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";

const schema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string(),
});

export async function GET() {
  const links = await prisma.socialLink.findMany();
  return NextResponse.json({ links });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const link = await prisma.socialLink.upsert({
    where: { platform: parsed.data.platform },
    update: { url: parsed.data.url },
    create: parsed.data,
  });

  return NextResponse.json({ success: true, link });
}
