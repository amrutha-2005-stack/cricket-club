import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  albumId: z.string().min(1),
  url: z.string().min(1),
  altText: z.string().optional(),
  caption: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const maxOrder = await prisma.galleryImage.aggregate({
    where: { albumId: parsed.data.albumId },
    _max: { order: true },
  });

  const image = await prisma.galleryImage.create({
    data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 },
  });

  return NextResponse.json({ success: true, image });
}
