/**
 * View / engagement beacon proxy.
 *
 * The browser must never see the content API's origin or its internal key, so
 * the beacon lands here and this route forwards it — the same reason
 * app/api/books/[slug]/subscribe/route.ts exists.
 *
 * Two things happen here that cannot happen upstream:
 *
 *   1. THE READER'S IP AND USER AGENT ARE FORWARDED EXPLICITLY. Upstream builds
 *      its per-day visitor hash from them. If it used the socket address it
 *      would see Vercel's egress node on every request and conclude the whole
 *      internet is one person, collapsing every article to a single view.
 *
 *   2. THE AUTHOR IS EXCLUDED. Anyone holding a valid admin session is the site
 *      owner proof-reading their own post; counting those passes is the fastest
 *      way to make the numbers useless to the one person who reads them.
 *
 * Always answers 200. A tracking beacon that returns an error paints a red line
 * in the console of a page that is working perfectly.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recordBlogView } from "@/components/utils/portfolio-api";
import { rateLimit } from "@/lib/rate-limit";
import { verifyToken, ADMIN_COOKIE } from "@/lib/admin-auth";

/** Never cache a beacon. */
export const dynamic = "force-dynamic";

/**
 * Generous on purpose. A real reader working through the archive can legitimately
 * open a dozen posts in an hour, and each post sends at most two beacons (one
 * view, one read). This is here to stop a script hammering the endpoint, not to
 * ration honest reading — and the unique key upstream is what makes hammering
 * pointless anyway.
 */
const MAX_BEACONS_PER_IP_PER_HOUR = 120;

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ua = req.headers.get("user-agent") || "";

  // The author's own reading is not traffic.
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (token && verifyToken(token)) {
    return NextResponse.json({ ok: true, counted: false, reason: "admin" });
  }

  if (!ip) {
    // No client identity means no way to deduplicate — counting it would be
    // counting an anonymous blob that could be anyone, any number of times.
    return NextResponse.json({ ok: true, counted: false, reason: "no-ip" });
  }

  const limit = rateLimit(`blog-view:${ip}`, MAX_BEACONS_PER_IP_PER_HOUR, 3600);
  if (!limit.allowed) {
    return NextResponse.json({ ok: true, counted: false, reason: "rate-limited" });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // An empty or malformed body is a plain view.
  }

  const event = body?.event === "read" ? "read" : "view";
  const dwellSeconds = Number.isFinite(body?.dwellSeconds)
    ? Math.max(0, Math.min(Math.trunc(body.dwellSeconds), 7200))
    : 0;
  const scrollPct = Number.isFinite(body?.scrollPct)
    ? Math.max(0, Math.min(Math.trunc(body.scrollPct), 100))
    : 0;
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : "";

  const result = await recordBlogView(
    params.slug,
    { event, dwellSeconds, scrollPct, referrer },
    { ip, ua }
  );

  // `result` is null when the upstream is unreachable — the page keeps whatever
  // count it server-rendered rather than flashing a zero.
  return NextResponse.json(result ?? { ok: true, counted: false, reason: "upstream-unavailable" });
}
