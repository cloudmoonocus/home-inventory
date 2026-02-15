import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = getDb();
  const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return NextResponse.json(categories);
}
