import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  bio: z.string().optional(),
  message: z.string().optional(),
  photoUrl: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const founder = await prisma.founder.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ success: true, founder });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const existing = await prisma.founder.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.founder.delete({ where: { id: params.id } });
  if (existing.photoUrl) await deleteFile(existing.photoUrl);

  return NextResponse.json({ success: true });
}
