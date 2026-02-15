export const categoryLabels: Record<string, string> = {
  electronics: "电子产品",
  furniture: "家具",
  kitchen: "厨房用品",
  clothing: "衣物",
  tools: "工具",
  books: "书籍",
  decor: "装饰品",
  appliances: "家电",
  sports: "运动",
  other: "其他",
};

export function getCategoryLabel(name: string): string {
  return categoryLabels[name] || name;
}
