/** EPUB download — the file uploaded to KDP, Google Play Books and Gumroad. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminExportEpub } from "@/components/utils/books-api";

export const maxDuration = 120;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad book id" }, { status: 400 });
  }

  try {
    const upstream = await adminExportEpub(id);
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition":
          upstream.headers.get("Content-Disposition") || `attachment; filename="book-${id}.epub"`,
        "Cache-Control": "no-store",
        "X-Book-Soft-Flags": upstream.headers.get("X-Book-Soft-Flags") || "",
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || "Export failed");
    const m = msg.match(/Books API (\d{3})/);
    const code = m && Number(m[1]) < 500 ? Number(m[1]) : 502;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
