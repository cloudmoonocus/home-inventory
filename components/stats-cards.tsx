"use client";

import {
  Package,
  Layers,
  ArrowDownToLine,
  ArrowUpToLine,
} from "lucide-react";

type StatsData = {
  totalItems: number;
  totalQuantity: number;
  smallItems: number;
  largeItems: number;
};

export function StatsCards({ stats }: { stats: StatsData | undefined }) {
  const cards = [
    {
      label: "物品种类",
      value: stats?.totalItems ?? 0,
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "物品总数",
      value: stats?.totalQuantity ?? 0,
      icon: Layers,
      color: "bg-accent text-accent-foreground",
    },
    {
      label: "小件物品",
      value: stats?.smallItems ?? 0,
      icon: ArrowDownToLine,
      color: "bg-chart-2/15 text-chart-2",
    },
    {
      label: "大件物品",
      value: stats?.largeItems ?? 0,
      icon: ArrowUpToLine,
      color: "bg-chart-1/15 text-chart-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.color}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold text-card-foreground">
              {stats ? card.value : "-"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
