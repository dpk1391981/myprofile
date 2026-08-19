/**
 * Admin single-post read / update / delete.
 *
 * Authenticated proxy in front of the content API — see the note in
 * ../route.ts about the two distinct credentials involved.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { adminUpdatePost, adminDeletePost } from "@/components/utils/portfolio-api";
import { revalidateBlog } from "@/lib/revalidate-blog";

const API_BASE = (
  process.env.PORTFOLIO_API_URL || "https://ai.vtechxhub.com/api/v1"
).replace(/\/+$/, "");
const INTERNAL_KEY = process.env.PORTFOLIO_API_KEY || "";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const res = await fetch(`${API_BASE}/portfolio/blogs-admin/${params.id}`, {
      headers: { "X-Internal-Key": INTERNAL_KEY, Accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: 502 });
    }
    const { post } = await res.json();
    return NextResponse.json({ blog: post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { post } = await adminUpdatePost(params.id, body);
    // An edit that the author cannot see on the live site reads as a failed
    // save, so the public caches are dropped before this responds.
    revalidateBlog(post?.slug);
    return NextResponse.json({ blog: post });
  } catch (err: any) {
    const msg = String(err.message || "");
    return NextResponse.json({ error: msg }, {
      status: msg.includes("404") ? 404 : 502,
    });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    await adminDeletePost(params.id);
    // The slug is already gone upstream — the route-level purge inside
    // revalidateBlog is what drops the cached page for it.
    revalidateBlog();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = String(err.message || "");
    return NextResponse.json({ error: msg }, {
      status: msg.includes("404") ? 404 : 502,
    });
  }
}
