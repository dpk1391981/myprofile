/**
 * Public cover images, served from officialdeepak.in rather than the agent's
 * host, so og:image and the Book schema `image` point at this site.
 *
 * Filenames are random per upload (see admin_upload_cover), so a year of
 * immutable caching is safe — a new cover is a new URL.
 */
import { fetchBookMedia } from "@/components/utils/books-api";

const NAME = /^[a-z0-9-]{1,200}\.jpg$/;

export async function GET(_req: Request, { params }: { params: { file: string } }) {
  if (!NAME.test(params.file)) return new Response("Not found", { status: 404 });
  try {
    const upstream = await fetchBookMedia(params.file);
    if (!upstream.ok) return new Response("Not found", { status: 404 });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
