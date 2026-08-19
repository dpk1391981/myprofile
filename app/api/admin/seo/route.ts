/**
 * Admin page-SEO config.
 *
 * Authenticated proxy in front of the content API's /portfolio/seo routes.
 *
 * Note the GET here fetches only the keys the site actually uses, because the
 * upstream API exposes SEO config per key rather than as a collection. That is
 * deliberate: the set of configurable pages is a property of this front end,
 * not of the content service, so it is listed here where it can be seen.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getSeoConfig, adminUpsertSeo } from "@/components/utils/portfolio-api";

/** Page keys the admin UI can configure. */
const SEO_KEYS = ["blog-index", "blog-defaults"] as const;

export async function GET() {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const results = await Promise.all(SEO_KEYS.map((k) => getSeoConfig(k)));
    // An unconfigured key yields null upstream; surface it as a bare row so the
    // admin form has something to render and edit.
    const configs = SEO_KEYS.map((key, i) => results[i] ?? { key });
    return NextResponse.json({ configs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { key, ...data } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const { config } = await adminUpsertSeo(key, data);
    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
