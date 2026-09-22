import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  eventDate: z.string().min(1, "Date is required"),
});

export async function GET() {
  const events = await prisma.eventItem.findMany({ orderBy: { eventDate: "asc" } });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });

  const event = await prisma.eventItem.create({
    data: { title: parsed.data.title, location: parsed.data.location, eventDate: new Date(parsed.data.eventDate) },
  });
  return NextResponse.json({ success: true, event });
}
