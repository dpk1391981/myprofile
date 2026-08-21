/**
 * Public subscribe proxy.
 *
 * Exists so the browser never sees the books API origin or its key: EmailGate
 * is a client component, and books-api.ts is server-only for exactly that
 * reason.
 *
 * Rate-limited per IP. Without it this is an open relay for confirmation mail —
 * anyone could point a loop at it and send thousands of messages from your
 * domain to addresses you do not own, which burns the sending reputation the
 * whole list depends on.
 */
import { NextResponse } from "next/server";
import { subscribeToBook } from "@/components/utils/books-api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // 5 signups per IP per hour. Window is in SECONDS — see lib/rate-limit.ts.
  const limit = rateLimit(`book-subscribe:${ip}`, 5, 3600);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many signups from this address. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const result = await subscribeToBook(params.slug, {
      email: String(body?.email || ""),
      name: String(body?.name || ""),
    });
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("404") ? 404 : msg.includes("422") ? 422 : 502;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
