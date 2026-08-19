/**
 * One gate for every admin API route.
 *
 * Middleware already rejects unauthenticated requests to /api/admin/*, but each
 * route re-checks here so the routes stay safe on their own — if the matcher is
 * ever narrowed, or a route is called internally, the check still runs.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_COOKIE } from "@/lib/admin-auth";

/** Returns a 401 response when the caller has no valid session, else null. */
export function requireAdmin(): NextResponse | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
