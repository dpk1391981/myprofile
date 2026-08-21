/**
 * Stages 2-3 — write the chapters, then the front and back matter.
 *
 * THIS ENDPOINT ACKS IN MILLISECONDS; THE RUN TAKES MINUTES TO TENS OF MINUTES.
 * The upstream returns as soon as the job is queued, so the response means
 * "started", not "done" — the UI must say so. Progress is read by polling
 * GET /api/admin/books/{id}: the agent commits after every chapter, so
 * `chapters` and `status` are real values, not an estimate.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminGenerateBook } from "@/components/utils/books-api";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }

  // resume=false rewrites chapters that already passed — it costs the full
  // book again, so it is opt-in rather than the default.
  const resume = new URL(req.url).searchParams.get("resume") !== "false";

  try {
    return NextResponse.json(await adminGenerateBook(id, resume));
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("409") ? 409 : msg.includes("400") ? 400 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
