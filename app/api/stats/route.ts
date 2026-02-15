import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = getDb();

  const [totalItems] = await sql`SELECT COUNT(*) as count FROM items`;
  const [totalQuantity] = await sql`SELECT COALESCE(SUM(quantity), 0) as total FROM items`;
  const [smallItems] = await sql`SELECT COUNT(*) as count FROM items WHERE size_type = 'small'`;
  const [largeItems] = await sql`SELECT COUNT(*) as count FROM items WHERE size_type = 'large'`;
  const categoryBreakdown = await sql`
    SELECT c.name, c.icon, COUNT(i.id) as count, COALESCE(SUM(i.quantity), 0) as total_quantity
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    GROUP BY c.id, c.name, c.icon
    ORDER BY count DESC
  `;
  const recentItems = await sql`
    SELECT i.*, c.name as category_name, c.icon as category_icon
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    ORDER BY i.created_at DESC
    LIMIT 5
  `;

  return NextResponse.json({
    totalItems: Number(totalItems.count),
    totalQuantity: Number(totalQuantity.total),
    smallItems: Number(smallItems.count),
    largeItems: Number(largeItems.count),
    categoryBreakdown,
    recentItems,
  });
}
