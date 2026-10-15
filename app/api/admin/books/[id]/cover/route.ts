/** Cover upload / removal. Multipart in, the updated admin book out. */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { adminDeleteCover, adminUploadCover } from "@/components/utils/books-api";

export const maxDuration = 60;

function bookId(params: { id: string }): number | null {
  const n = Number(params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function statusOf(msg: string): number {
  const m = msg.match(/Books API (\d{3})/);
  const code = m ? Number(m[1]) : 502;
  return code >= 400 && code < 500 ? code : 502;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;
  const id = bookId(params);
  if (!id) return NextResponse.json({ error: "Bad book id" }, { status: 400 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }
    const name = (file as File).name || "cover.jpg";
    const book = await adminUploadCover(id, file, name);
    revalidatePath("/books");
    if (book?.slug) revalidatePath(`/books/${book.slug}`);
    return NextResponse.json({ book });
  } catch (err: any) {
    const msg = String(err?.message || "Upload failed");
    return NextResponse.json({ error: msg }, { status: statusOf(msg) });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;
  const id = bookId(params);
  if (!id) return NextResponse.json({ error: "Bad book id" }, { status: 400 });

  try {
    const book = await adminDeleteCover(id);
    revalidatePath("/books");
    if (book?.slug) revalidatePath(`/books/${book.slug}`);
    return NextResponse.json({ book });
  } catch (err: any) {
    const msg = String(err?.message || "Failed");
    return NextResponse.json({ error: msg }, { status: statusOf(msg) });
  }
}
