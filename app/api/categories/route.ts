import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[v0] GET /api/categories error:", error);
    return NextResponse.json(
      { error: "获取分类列表失败" },
      { status: 500 }
    );
  }
}
