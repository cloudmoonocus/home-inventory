import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "@/lib/env"; // Validate environment variables at startup

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "家庭物品管理 - 轻松追踪您的家庭库存",
  description:
    "一个全面的家庭物品管理平台，帮助您追踪、分类和管理家中的各类物品。支持添加、编辑、删除物品，按分类和规格筛选。",
};

export const viewport: Viewport = {
  themeColor: "#3574b8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
