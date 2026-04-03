import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { connectToDB } from "@/utils/database";
import SeoConfig from "@/models/SeoConfig";

function requireAuth() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET all SEO configs
export async function GET() {
  const authError = requireAuth();
  if (authError) return authError;

  await connectToDB();
  const configs = await SeoConfig.find({}).lean();
  return NextResponse.json({ configs });
}

// POST — upsert a config by key
export async function POST(req: Request) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { key, ...data } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    await connectToDB();
    const config = await SeoConfig.findOneAndUpdate(
      { key },
      { ...data, key },
      { upsert: true, new: true }
    );

    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
