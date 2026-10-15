/**
 * Pause a running generation. The agent stops after the section it is writing
 * (it cannot interrupt a model call in flight), keeps every saved section, and
 * sets the book to "paused". Resume continues from there.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminPauseBook } from "@/components/utils/books-api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }

  try {
    return NextResponse.json(await adminPauseBook(id));
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("409") ? 409 : msg.includes("404") ? 404 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
