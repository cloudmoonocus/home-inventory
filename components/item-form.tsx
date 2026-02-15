"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Item, Category } from "@/lib/db";
import { getCategoryLabel } from "@/lib/category-labels";

type ItemFormProps = {
  item?: Item | null;
  categories: Category[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
};

export function ItemForm({ item, categories, onSubmit, onClose }: ItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    size_type: "small" as "small" | "large",
    quantity: 1,
    source: "",
    location: "",
    purchase_date: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category_id: item.category_id ? String(item.category_id) : "",
        size_type: item.size_type,
        quantity: item.quantity,
        source: item.source || "",
        location: item.location || "",
        purchase_date: item.purchase_date
          ? new Date(item.purchase_date).toISOString().split("T")[0]
          : "",
        notes: item.notes || "",
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        quantity: Number(formData.quantity),
        purchase_date: formData.purchase_date || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm pt-[10vh]">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            {item ? "编辑物品" : "添加物品"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
          <div className="space-y-4">
            {/* Name - required */}
            <div>
              <label htmlFor="item-name" className={labelClass}>
                物品名称 <span className="text-destructive">*</span>
              </label>
              <input
                id="item-name"
                type="text"
                required
                placeholder="例：电饭煲"
                className={fieldClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </div>

            {/* Category & Size Type - row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="item-category" className={labelClass}>分类</label>
                <select
                  id="item-category"
                  className={fieldClass}
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="">未分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryLabel(c.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  规格 <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.size_type === "small"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, size_type: "small" })
                    }
                  >
                    小件
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.size_type === "large"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, size_type: "large" })
                    }
                  >
                    大件
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity & Source - row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="item-quantity" className={labelClass}>数量</label>
                <input
                  id="item-quantity"
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label htmlFor="item-source" className={labelClass}>来源</label>
                <input
                  id="item-source"
                  type="text"
                  placeholder="例：京东"
                  className={fieldClass}
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Location & Purchase Date - row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="item-location" className={labelClass}>存放位置</label>
                <input
                  id="item-location"
                  type="text"
                  placeholder="例：客厅"
                  className={fieldClass}
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="item-date" className={labelClass}>购买日期</label>
                <input
                  id="item-date"
                  type="date"
                  className={fieldClass}
                  value={formData.purchase_date}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="item-notes" className={labelClass}>备注</label>
              <textarea
                id="item-notes"
                rows={2}
                placeholder="补充说明..."
                className={`${fieldClass} resize-none`}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : item ? "保存更改" : "添加物品"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
