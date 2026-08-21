/**
 * Publish / unpublish.
 *
 * A 409 from upstream means chapters are still flagged for review. It is
 * forwarded AS 409 with its message intact rather than collapsed into a
 * generic 502, because that message is the one check standing between a weak
 * chapter and the public site — the UI needs to show it and offer the override.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminPublishBook } from "@/components/utils/books-api";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }

  const qs = new URL(req.url).searchParams;
  const publish = qs.get("publish") !== "false";
  const allowFlagged = qs.get("allow_flagged") === "true";

  try {
    const book = await adminPublishBook(id, publish, allowFlagged);
    // The public listing and the book page are statically revalidated; without
    // this, a just-published book stays invisible for up to five minutes.
    revalidatePath("/books");
    if (book?.slug) revalidatePath(`/books/${book.slug}`);
    return NextResponse.json({ book });
  } catch (err: any) {
    if (err?.needsAcknowledgement) {
      return NextResponse.json(
        { error: err.message, needsAcknowledgement: true },
        { status: 409 }
      );
    }
    // Under the page floor. Forwarded as 422 with its message intact: it names
    // the actual page count, which is the whole point of the check.
    if (err?.tooShort) {
      return NextResponse.json({ error: err.message, tooShort: true }, { status: 422 });
    }
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
