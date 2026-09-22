import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1).default("A Historic Chapter"),
  story: z.string().min(1, "Story text is required"),
  year: z.number().int().optional().nullable(),
  caption: z.string().optional(),
  additionalNotes: z.string().optional(),
  videoUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
});

export async function GET() {
  const stories = await prisma.historicalStory.findMany({
    orderBy: { order: "asc" },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ stories });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const { imageUrls, ...rest } = parsed.data;
  const maxOrder = await prisma.historicalStory.aggregate({ _max: { order: true } });

  const story = await prisma.historicalStory.create({
    data: {
      ...rest,
      order: (maxOrder._max.order ?? -1) + 1,
      images: {
        create: (imageUrls || []).filter(Boolean).map((url, i) => ({ url, order: i })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json({ success: true, story });
}
