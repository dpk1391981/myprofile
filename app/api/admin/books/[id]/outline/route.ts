/**
 * Stage 1 — build the table of contents.
 *
 * Awaited inline: it is a single model call (~10s), and the admin needs to read
 * the outline before authorising the expensive part.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminBuildOutline } from "@/components/utils/books-api";

export const maxDuration = 120;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }

  try {
    return NextResponse.json(await adminBuildOutline(id));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
