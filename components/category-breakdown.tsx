"use client";

import {
  Monitor,
  Sofa,
  UtensilsCrossed,
  Shirt,
  Wrench,
  BookOpen,
  Lamp,
  Refrigerator,
  Dumbbell,
  Package,
} from "lucide-react";
import { getCategoryLabel } from "@/lib/category-labels";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Sofa,
  UtensilsCrossed,
  Shirt,
  Wrench,
  BookOpen,
  Lamp,
  Refrigerator,
  Dumbbell,
  Package,
};

type CategoryStat = {
  name: string;
  icon: string;
  count: string | number;
  total_quantity: string | number;
};

export function CategoryBreakdown({ data }: { data: CategoryStat[] | undefined }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((c) => Number(c.total_quantity)), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
        分类概览
      </h3>
      <div className="space-y-3">
        {data.map((cat) => {
          const IconComp = iconMap[cat.icon] || Package;
          const qty = Number(cat.total_quantity);
          const pct = maxCount > 0 ? (qty / maxCount) * 100 : 0;
          return (
            <div key={cat.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  <IconComp className="h-4 w-4 text-muted-foreground" />
                  <span>{getCategoryLabel(cat.name)}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Number(cat.count)} 种 / {qty} 件
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
