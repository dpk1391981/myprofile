import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge, ADMIN_COOKIE } from "@/lib/admin-auth-edge";

/** Login page and the login endpoint must stay reachable without a session. */
const PUBLIC_ADMIN_PATHS = new Set(["/admin", "/api/admin/auth"]);

function harden(res: NextResponse): NextResponse {
  // Admin pages must never be framed, sniffed, indexed, or leak referrers.
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isApi = pathname.startsWith("/api/admin");

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    // Someone already signed in has no reason to see the login form again.
    if (pathname === "/admin" && (await verifyTokenEdge(token))) {
      return harden(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
    }
    return harden(NextResponse.next());
  }

  // The signature is checked here, not just the cookie's presence — otherwise
  // any self-set `admin_token` value would walk straight past this gate.
  if (await verifyTokenEdge(token)) {
    return harden(NextResponse.next());
  }

  if (isApi) {
    return harden(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
  }

  const login = new URL("/admin", request.url);
  const res = harden(NextResponse.redirect(login));
  // Drop the rejected cookie so a stale or forged one stops being replayed.
  if (token) res.cookies.delete(ADMIN_COOKIE);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
