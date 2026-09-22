import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const post = await prisma.newsPost.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.newsPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.newsPost.delete({ where: { id: params.id } });
  if (existing.imageUrl) await deleteFile(existing.imageUrl);

  return NextResponse.json({ success: true });
}
