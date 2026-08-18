/**
 * Admin blog list + create.
 *
 * This route is now a thin authenticated proxy in front of the content API on
 * the agent service — the posts themselves live in MySQL (`portfolio_blogs`) on
 * that host, which this app cannot reach directly from Vercel.
 *
 * Two separate credentials are in play and they are not interchangeable:
 *   - the `admin_token` cookie authenticates the human using the admin UI;
 *   - `PORTFOLIO_API_KEY` (held server-side, injected by portfolio-api.ts)
 *     authenticates this service to the content API.
 * The cookie is checked FIRST, so a caller without a valid admin session can
 * never borrow this route's API key to reach the upstream write endpoints.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { adminListPosts, adminCreatePost } from "@/components/utils/portfolio-api";

function requireAuth() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const { posts, total } = await adminListPosts();
    // `blogs` keeps the key the existing admin UI already reads.
    return NextResponse.json({ blogs: posts, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    // Slug and date defaults are applied upstream, so they are not duplicated
    // here — one place deciding them keeps the two paths from disagreeing.
    const { post } = await adminCreatePost(body);
    return NextResponse.json({ blog: post }, { status: 201 });
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("422") ? 422 : msg.includes("409") ? 409 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
