import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { connectToDB } from "@/utils/database";
import Blog from "@/models/Blog";

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

  await connectToDB();
  const blog = await Blog.findById(params.id).lean();
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ blog });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    await connectToDB();
    const blog = await Blog.findByIdAndUpdate(params.id, body, { new: true });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAuth();
  if (authError) return authError;

  await connectToDB();
  await Blog.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
