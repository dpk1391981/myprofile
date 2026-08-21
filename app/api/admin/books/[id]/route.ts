/** Admin single-book read / update / delete. See ../route.ts for the auth model. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  adminGetBook,
  adminUpdateBook,
  adminDeleteBook,
} from "@/components/utils/books-api";

function bookId(params: { id: string }): number | null {
  const n = Number(params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = bookId(params);
  if (!id) return NextResponse.json({ error: "Bad book id" }, { status: 400 });

  try {
    return NextResponse.json({ book: await adminGetBook(id) });
  } catch (err: any) {
    const status = String(err.message || "").includes("404") ? 404 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = bookId(params);
  if (!id) return NextResponse.json({ error: "Bad book id" }, { status: 400 });

  try {
    const body = await req.json();
    return NextResponse.json({ book: await adminUpdateBook(id, body) });
  } catch (err: any) {
    const msg = String(err.message || "");
    const status = msg.includes("404") ? 404 : msg.includes("422") ? 422 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  const id = bookId(params);
  if (!id) return NextResponse.json({ error: "Bad book id" }, { status: 400 });

  try {
    return NextResponse.json(await adminDeleteBook(id));
  } catch (err: any) {
    const status = String(err.message || "").includes("404") ? 404 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
