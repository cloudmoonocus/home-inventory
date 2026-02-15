import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export function getDb() {
  return sql;
}

export type Category = {
  id: number;
  name: string;
  icon: string;
  created_at: string;
};

export type Item = {
  id: number;
  name: string;
  category_id: number | null;
  category_name?: string;
  category_icon?: string;
  size_type: "small" | "large";
  quantity: number;
  source: string | null;
  location: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
