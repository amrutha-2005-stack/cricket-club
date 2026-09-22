import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  bio: z.string().optional(),
  message: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function GET() {
  const founders = await prisma.founder.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ founders });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const maxOrder = await prisma.founder.aggregate({ _max: { order: true } });
  const founder = await prisma.founder.create({ data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 } });
  return NextResponse.json({ success: true, founder });
}
