import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const image = await prisma.galleryImage.findUnique({ where: { id: params.id } });
  if (!image) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.galleryImage.delete({ where: { id: params.id } });
  await deleteFile(image.url);

  return NextResponse.json({ success: true });
}
