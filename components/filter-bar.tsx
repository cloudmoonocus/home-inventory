"use client";

import { Search, X } from "lucide-react";
import type { Category } from "@/lib/db";
import { getCategoryLabel } from "@/lib/category-labels";

type FilterBarProps = {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  sizeType: string;
  onSizeTypeChange: (val: string) => void;
  categories: Category[];
};

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sizeType,
  onSizeTypeChange,
  categories,
}: FilterBarProps) {
  const hasFilters = search || category || sizeType;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索物品名称、位置、来源..."
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <select
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="按分类筛选"
      >
        <option value="">全部分类</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {getCategoryLabel(c.name)}
          </option>
        ))}
      </select>

      {/* Size type filter */}
      <select
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={sizeType}
        onChange={(e) => onSizeTypeChange(e.target.value)}
        aria-label="按规格筛选"
      >
        <option value="">全部规格</option>
        <option value="small">小件</option>
        <option value="large">大件</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => {
            onSearchChange("");
            onCategoryChange("");
            onSizeTypeChange("");
          }}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="清除筛选"
        >
          <X className="h-3.5 w-3.5" />
          清除
        </button>
      )}
    </div>
  );
}
