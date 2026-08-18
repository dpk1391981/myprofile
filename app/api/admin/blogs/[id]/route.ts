/**
 * Admin single-post read / update / delete.
 *
 * Authenticated proxy in front of the content API — see the note in
 * ../route.ts about the two distinct credentials involved.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { adminUpdatePost, adminDeletePost } from "@/components/utils/portfolio-api";

const API_BASE = (
  process.env.PORTFOLIO_API_URL || "https://ai.vtechxhub.com/api/v1"
).replace(/\/+$/, "");
const INTERNAL_KEY = process.env.PORTFOLIO_API_KEY || "";

function requireAuth() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAuth();
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
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { post } = await adminUpdatePost(params.id, body);
    return NextResponse.json({ blog: post });
  } catch (err: any) {
    const msg = String(err.message || "");
    return NextResponse.json({ error: msg }, {
      status: msg.includes("404") ? 404 : 502,
    });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    await adminDeletePost(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const msg = String(err.message || "");
    return NextResponse.json({ error: msg }, {
      status: msg.includes("404") ? 404 : 502,
    });
  }
}
