/**
 * Live / inactive switch for a published book.
 *
 * Inactive hides the book from every public surface — /books, the home page
 * promo, chapter pages, sitemap, llms.txt — while it stays published, so
 * switching it back on is one click and does not re-run the publish gates.
 */
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { adminSetBookActive, BOOKS_CACHE_TAG } from "@/components/utils/books-api";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }
  const active = new URL(req.url).searchParams.get("active");
  if (active !== "true" && active !== "false") {
    return NextResponse.json({ error: "active must be true or false" }, { status: 400 });
  }

  try {
    const book = await adminSetBookActive(id, active === "true");
    // Every cached book read, then the pages built from them. Without this a
    // hidden book stays on the home page for up to an hour.
    revalidateTag(BOOKS_CACHE_TAG);
    revalidatePath("/");
    revalidatePath("/books", "layout");
    return NextResponse.json({ book });
  } catch (err: any) {
    const msg = String(err.message || "");
    return NextResponse.json({ error: msg }, { status: msg.includes("404") ? 404 : 502 });
  }
}
