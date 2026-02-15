import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
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
      UPDATE items
      SET name = ${name},
          category_id = ${category_id || null},
          size_type = ${size_type},
          quantity = ${quantity || 1},
          source = ${source || null},
          location = ${location || null},
          purchase_date = ${purchase_date || null},
          notes = ${notes || null},
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "物品不存在" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("[v0] PUT /api/items/[id] error:", error);
    return NextResponse.json(
      { error: "更新物品失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const result = await sql`
      DELETE FROM items WHERE id = ${Number(id)} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "物品不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE /api/items/[id] error:", error);
    return NextResponse.json(
      { error: "删除物品失败" },
      { status: 500 }
    );
  }
}
