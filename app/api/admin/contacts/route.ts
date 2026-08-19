/**
 * Admin contact inbox.
 *
 * Enquiries now land in MySQL (`portfolio_contact`) via the content API rather
 * than in MongoDB, so this route reads them back through the same authenticated
 * proxy pattern the blog routes use.
 *
 * DELETE is intentionally not implemented any more. Enquiries are the record of
 * someone actually reaching out, and the upstream table has a `status` column
 * ('new' / 'read' / 'replied' / 'archived') for exactly this — archiving keeps
 * the message recoverable where a hard delete did not.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminListContacts } from "@/components/utils/portfolio-api";

export async function GET() {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const { contacts, total } = await adminListContacts();
    return NextResponse.json({ contacts, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
