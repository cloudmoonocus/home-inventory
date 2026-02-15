import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
  let paramIndex = 1;

  if (search) {
    query += ` AND (i.name ILIKE $${paramIndex} OR i.location ILIKE $${paramIndex} OR i.source ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    query += ` AND i.category_id = $${paramIndex}`;
    params.push(Number(category));
    paramIndex++;
  }

  if (sizeType && (sizeType === "small" || sizeType === "large")) {
    query += ` AND i.size_type = $${paramIndex}`;
    params.push(sizeType);
    paramIndex++;
  }

  query += ` ORDER BY i.updated_at DESC`;

  const items = await sql(query, params);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
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
}
