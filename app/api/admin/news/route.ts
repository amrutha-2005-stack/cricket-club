import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET() {
  const news = await prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json({ news });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const post = await prisma.newsPost.create({ data: parsed.data });
  return NextResponse.json({ success: true, post });
}
