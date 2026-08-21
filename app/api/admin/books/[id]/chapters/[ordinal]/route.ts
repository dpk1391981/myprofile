/** Hand-edit one chapter — the human pass the automated gates cannot replace. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminUpdateChapter } from "@/components/utils/books-api";

export async function PUT(
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
    const chapter = await adminUpdateChapter(id, ordinal, body);
    return NextResponse.json({ chapter });
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("404") ? 404 : msg.includes("400") ? 400 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
