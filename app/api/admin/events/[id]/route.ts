import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().optional(),
  eventDate: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const { eventDate, ...rest } = parsed.data;
  const event = await prisma.eventItem.update({
    where: { id: params.id },
    data: { ...rest, ...(eventDate ? { eventDate: new Date(eventDate) } : {}) },
  });
  return NextResponse.json({ success: true, event });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  await prisma.eventItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
