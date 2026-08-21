/** The email list the books exist to build. Read-only from the admin UI. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminListSubscribers } from "@/components/utils/books-api";

export async function GET(req: Request) {
  const authError = requireAdmin();
  if (authError) return authError;

  const confirmedOnly = new URL(req.url).searchParams.get("confirmed") === "true";

  try {
    return NextResponse.json(await adminListSubscribers(confirmedOnly));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
