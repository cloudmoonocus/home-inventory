import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sizeType = searchParams.get("size_type") || "";

    let query = `
      SELECT i.*, c.name as category_name, c.icon as category_icon
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      query += ` AND (i.name ILIKE $1 OR i.location ILIKE $1 OR i.source ILIKE $1 OR i.notes ILIKE $1)`;
      params.push(`%${search}%`);
    }

    if (category && !isNaN(Number(category))) {
      query += ` AND i.category_id = $${params.length + 1}`;
      params.push(Number(category));
    }

    if (sizeType && (sizeType === "small" || sizeType === "large")) {
      query += ` AND i.size_type = $${params.length + 1}`;
      params.push(sizeType);
    }

    query += ` ORDER BY i.updated_at DESC`;

    const items = await sql(query, ...params);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[v0] GET /api/items error:", error);
    return NextResponse.json(
      { error: "获取物品列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const {
      name,
      category_id,
      size_type,
      quantity,
      source,
      location,
      purchase_date,
      notes,
    } = body;

    if (!name || !size_type) {
      return NextResponse.json(
        { error: "名称和物品规格为必填项" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO items (name, category_id, size_type, quantity, source, location, purchase_date, notes)
      VALUES (${name}, ${category_id || null}, ${size_type}, ${quantity || 1}, ${source || null}, ${location || null}, ${purchase_date || null}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("[v0] POST /api/items error:", error);
    return NextResponse.json(
      { error: "添加物品失败" },
      { status: 500 }
    );
  }
}
