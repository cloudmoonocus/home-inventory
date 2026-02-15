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
    <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="搜索物品..."
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 sm:gap-3">
        {/* Category filter */}
        <select
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="按分类筛选"
        >
          <option value="">分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {getCategoryLabel(c.name)}
            </option>
          ))}
        </select>

        {/* Size type filter */}
        <select
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={sizeType}
          onChange={(e) => onSizeTypeChange(e.target.value)}
          aria-label="按规格筛选"
        >
          <option value="">规格</option>
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
            className="rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            aria-label="清除筛选"
            title="清除所有筛选"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
