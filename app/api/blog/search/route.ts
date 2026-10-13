/**
 * GET /api/blog/search?q=…  — instant results for the mobile search sheet.
 *
 * The same search /blog?q= runs (components/utils/blog-search.ts) over the same
 * cached post list, trimmed to the handful of fields a result row shows. It
 * adds no load upstream: listAllPosts is served from Next's 300s data cache,
 * so a search is an in-memory filter, not a request to the agent service.
 *
 * Responses are CDN-cacheable per query string, so the popular searches
 * ("react", "rag") are answered at the edge and never reach this function.
 * The rate limit covers the rest — a script walking every possible prefix.
 */
import { NextResponse } from "next/server";
import { getAllPosts } from "@/components/utils/blog-index-posts";
import { searchPosts, normaliseQuery } from "@/components/utils/blog-search";
import { rateLimit } from "@/lib/rate-limit";

/** Rows sent to the sheet. The full list is one tap away at /blog?q=. */
const MAX_RESULTS = 20;
const MAX_REQUESTS_PER_IP_PER_MINUTE = 120;

export async function GET(req: Request) {
  const q = normaliseQuery(new URL(req.url).searchParams.get("q"));
  if (!q) {
    return NextResponse.json({ q, total: 0, results: [] });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  const limit = rateLimit(`blog-search:${ip}`, MAX_REQUESTS_PER_IP_PER_MINUTE, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many searches — try again in a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const matches = searchPosts(await getAllPosts(), q);

  return NextResponse.json(
    {
      q,
      total: matches.length,
      results: matches.slice(0, MAX_RESULTS).map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        readTime: p.readTime,
        category: p.category || p.tags[0] || "",
      })),
    },
    {
      // Same lifetime as the post list underneath it; serve stale while the
      // edge refreshes so no reader waits on a revalidation.
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    },
  );
}
