/**
 * Admin books list + create.
 *
 * A thin authenticated proxy in front of the books API on the agent service —
 * the books live in MySQL on that host, which this app cannot reach directly
 * from Vercel.
 *
 * Two separate credentials, not interchangeable:
 *   - the `admin_token` cookie authenticates the human using the admin UI;
 *   - `PORTFOLIO_API_KEY` (server-side, injected by books-api.ts) authenticates
 *     this service to the books API.
 * The cookie is checked FIRST, so a caller without a valid admin session can
 * never borrow this route's API key to reach the upstream write endpoints.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminListBooks, adminCreateBook } from "@/components/utils/books-api";

export async function GET() {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const { books, total } = await adminListBooks();
    return NextResponse.json({ books, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const book = await adminCreateBook(body);
    return NextResponse.json({ book }, { status: 201 });
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("422") ? 422 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
