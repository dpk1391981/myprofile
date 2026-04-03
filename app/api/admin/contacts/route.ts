import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { connectToDB } from "@/utils/database";
import Enquery from "@/models/hire";

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
  const contacts = await Enquery.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ contacts });
}

export async function DELETE(req: Request) {
  const authError = requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await connectToDB();
  await Enquery.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
