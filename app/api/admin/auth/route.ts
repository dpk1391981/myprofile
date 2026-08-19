/**
 * Admin login / logout / session probe.
 *
 * This is the one admin endpoint middleware lets through unauthenticated, so
 * the throttle below is the only thing standing between the internet and
 * unlimited password guesses.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createToken,
  verifyToken,
  sessionCookieOptions,
  ADMIN_COOKIE,
} from "@/lib/admin-auth";
import { rateLimit, resetRateLimit, clientIp } from "@/lib/rate-limit";

/** 8 attempts per 15 minutes per IP. */
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const { username, password } = await req.json();

    if (!verifyCredentials(username, password)) {
      // One generic message for bad user, bad password, and unconfigured auth —
      // nothing here should help an attacker tell those cases apart.
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    resetRateLimit(`login:${ip}`);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, createToken(), sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Overwrite before deleting so the browser drops it even if the delete is
  // ignored for a path/attribute mismatch.
  response.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}

export async function GET() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
