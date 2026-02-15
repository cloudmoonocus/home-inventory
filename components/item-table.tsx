"use client";

import {
  Pencil,
  Trash2,
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
  MapPin,
  Store,
} from "lucide-react";
import type { Item } from "@/lib/db";
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

type ItemTableProps = {
  items: Item[] | undefined;
  isLoading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
};

export function ItemTable({ items, isLoading, onEdit, onDelete }: ItemTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Package className="mb-3 h-10 w-10" />
        <p className="text-sm">暂无物品记录</p>
        <p className="text-xs mt-1">点击上方按钮添加第一件物品</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop table */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              物品
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              分类
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
              规格
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
              数量
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              来源
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              位置
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const IconComp = iconMap[item.category_icon || ""] || Package;
            return (
              <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <IconComp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {item.category_name ? getCategoryLabel(item.category_name) : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.size_type === "small"
                        ? "bg-chart-2/15 text-chart-2"
                        : "bg-chart-1/15 text-chart-1"
                    }`}
                  >
                    {item.size_type === "small" ? "小件" : "大件"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums text-foreground">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item.source || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item.location || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      aria-label={`编辑 ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`删除 ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {items.map((item) => {
          const IconComp = iconMap[item.category_icon || ""] || Package;
          return (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <IconComp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.size_type === "small"
                            ? "bg-chart-2/15 text-chart-2"
                            : "bg-chart-1/15 text-chart-1"
                        }`}
                      >
                        {item.size_type === "small" ? "小件" : "大件"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label={`编辑 ${item.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`删除 ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {item.category_name && (
                  <span>{getCategoryLabel(item.category_name)}</span>
                )}
                {item.source && (
                  <span className="flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {item.source}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
