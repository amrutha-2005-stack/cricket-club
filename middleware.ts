// Protects every /admin/dashboard route. Runs in the Edge runtime, so this
// file deliberately does NOT import lib/auth.ts (which uses next/headers —
// meant for Server Components / Route Handlers, not middleware). It
// duplicates the minimal JWT verification instead, using the same secret
// and the same "jose" library (which is edge-compatible).

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "bfc_admin_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
