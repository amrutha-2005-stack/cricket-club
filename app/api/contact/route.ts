import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(4000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const { name, email, phone, message } = parsed.data;

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, message },
  });

  // Future: trigger an email/Slack notification to the club here.
  return NextResponse.json({ success: true });
}
