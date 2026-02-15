"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Plus, Home, ChevronDown } from "lucide-react";
import type { Item, Category } from "@/lib/db";
import { StatsCards } from "./stats-cards";
import { CategoryBreakdown } from "./category-breakdown";
import { ItemTable } from "./item-table";
import { FilterBar } from "./filter-bar";
import { ItemForm } from "./item-form";
import { DeleteConfirm } from "./delete-confirm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Dashboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sizeType, setSizeType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Build query string for items
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (sizeType) params.set("size_type", sizeType);
  const queryString = params.toString();

  const { data: items, isLoading: itemsLoading, mutate: mutateItems } = useSWR<Item[]>(
    `/api/items${queryString ? `?${queryString}` : ""}`,
    fetcher
  );
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);
  const { data: stats, mutate: mutateStats } = useSWR(
    "/api/stats",
    fetcher
  );

  const handleAdd = useCallback(async (data: Record<string, unknown>) => {
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutateItems();
    mutateStats();
    setShowForm(false);
  }, [mutateItems, mutateStats]);

  const handleEdit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!editItem) return;
      await fetch(`/api/items/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      mutateItems();
      mutateStats();
      setEditItem(null);
    },
    [editItem, mutateItems, mutateStats]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    await fetch(`/api/items/${deleteId}`, { method: "DELETE" });
    mutateItems();
    mutateStats();
    setDeleteId(null);
    setDeleteLoading(false);
  }, [deleteId, mutateItems, mutateStats]);

  // Debounced search
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">
                家庭物品管理
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                轻松管理您的家庭物品库存
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加物品</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        {/* Stats toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showStats ? 'rotate-180' : ''}`} />
            {showStats ? "收起概览" : "展开概览"}
          </button>
          {items && (
            <span className="text-sm text-muted-foreground">
              共 {items.length} 条记录
            </span>
          )}
        </div>

        {/* Stats section */}
        {showStats && (
          <div className="mb-6 space-y-4">
            <StatsCards stats={stats} />
            <div className="grid gap-4 lg:grid-cols-1">
              <CategoryBreakdown data={stats?.categoryBreakdown} />
            </div>
          </div>
        )}

        {/* Items section */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <FilterBar
              search={search}
              onSearchChange={handleSearchChange}
              category={category}
              onCategoryChange={setCategory}
              sizeType={sizeType}
              onSizeTypeChange={setSizeType}
              categories={categories || []}
            />
          </div>
          <ItemTable
            items={items}
            isLoading={itemsLoading}
            onEdit={(item) => setEditItem(item)}
            onDelete={(id) => setDeleteId(id)}
          />
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <ItemForm
          categories={categories || []}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
      {editItem && (
        <ItemForm
          item={editItem}
          categories={categories || []}
          onSubmit={handleEdit}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteId !== null && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
