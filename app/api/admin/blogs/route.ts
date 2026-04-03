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

export async function GET() {
  const authError = requireAuth();
  if (authError) return authError;

  await connectToDB();
  const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ blogs });
}

export async function POST(req: Request) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    await connectToDB();

    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Auto-set date if missing
    if (!body.date) {
      body.date = new Date().toISOString().split("T")[0];
    }

    const blog = new Blog(body);
    await blog.save();
    return NextResponse.json({ blog }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
