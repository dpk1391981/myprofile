/**
 * Apply or dismiss fact-check suggestions on one chapter, by index.
 * apply  = replace the "Book says" sentence with "Should read" in the text.
 * dismiss = the checker was wrong; drop the item, text unchanged.
 */
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { adminFactFixes, BOOKS_CACHE_TAG } from "@/components/utils/books-api";

export async function POST(
  req: Request,
  { params }: { params: { id: string; ordinal: string } }
) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  const ordinal = Number(params.ordinal);
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(ordinal) || ordinal <= 0) {
    return NextResponse.json({ error: "Bad book id or chapter number" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const ints = (v: unknown) =>
      Array.isArray(v) ? v.filter((n) => Number.isInteger(n) && n >= 0).slice(0, 20) : [];
    const result = await adminFactFixes(id, ordinal, ints(body.apply), ints(body.dismiss));
    // A published chapter's text just changed — do not serve the cached one.
    revalidateTag(BOOKS_CACHE_TAG);
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("409") ? 409 : msg.includes("404") ? 404 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
