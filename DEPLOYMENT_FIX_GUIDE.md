# DEPLOYMENT_NOT_FOUND 错误修复指南

## 问题诊断

你遇到的 `DEPLOYMENT_NOT_FOUND` 错误不是由路由配置问题引起的，而是由于以下几个原因导致的部署失败：

### 根本原因

1. **缺失的环境变量** - `DATABASE_URL` 没有在 Vercel 中配置
2. **API 路由中的数据库连接错误** - Neon SQL 客户端的不正确初始化
3. **错误的参数化查询方式** - 参数传递方式不符合 Neon API 规范
4. **缺乏错误处理** - API 路由在异常时没有适当的错误响应
5. **危险的构建配置** - `next.config.mjs` 中的 `ignoreBuildErrors: true` 隐藏了真实的构建错误

## 已应用的修复

### 1. **修复了 Neon 数据库连接** (`lib/db.ts`)
```typescript
// 错误方式（之前）
export function getDb() {
  return neon(process.env.DATABASE_URL!);  // 每次调用都创建新连接
}

// 正确方式（现在）
const sql = neon(process.env.DATABASE_URL!);
export function getDb() {
  return sql;  // 复用同一个连接
}
```
**为什么重要**: Neon 的 `neon()` 函数创建 SQL 客户端，应该只调用一次并复用，不应该在每次请求时重新创建。

### 2. **修复了参数化查询** (`app/api/items/route.ts`)
```typescript
// 错误方式（之前）
const params: (string | number)[] = [];
let paramIndex = 1;
query += ` AND (i.name ILIKE $${paramIndex} OR ...)`; // 手动跟踪参数索引
await sql(query, params);  // 数组传递

// 正确方式（现在）
await sql(query, ...params);  // 使用扩展运算符
```
**为什么重要**: Neon 的模板字符串 API 使用 `$1, $2` 标记参数位置，需要按顺序通过扩展运算符传递。

### 3. **添加了全局错误处理** (所有 API 路由)
```typescript
export async function GET(request: NextRequest) {
  try {
    // 业务逻辑
    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] GET /api/items error:", error);
    return NextResponse.json(
      { error: "获取物品列表失败" },
      { status: 500 }
    );
  }
}
```
**为什么重要**: 未捕获的异常会导致 API 路由返回 5xx 错误，影响整个部署的可靠性。

### 4. **移除了危险的构建配置** (`next.config.mjs`)
```typescript
// 错误方式（之前）
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // 隐藏所有 TypeScript 错误，很危险！
  }
}

// 正确方式（现在）
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json',  // 启用严格的类型检查
  },
}
```
**为什么重要**: 禁用错误检查会导致编译时错误逃逸到生产环境。

### 5. **添加了环境变量验证** (`lib/env.ts`)
在应用启动时验证必要的环境变量，如果缺失则立即失败。

### 6. **创建了错误边界** (`app/error.tsx`)
提供用户友好的错误页面，而不是默认的崩溃界面。

## 部署前检查清单

在部署到自定义域名前，请确保：

### 1. 配置环境变量
在 Vercel 项目的 **Settings → Environment Variables** 中：
- ✅ 添加 `DATABASE_URL` 并设置为你的 Neon 数据库连接字符串
- ✅ 确保变量同时应用于 Production、Preview 和 Development 环境

### 2. 验证数据库连接
运行以下命令本地测试：
```bash
npm run dev
```
访问 `http://localhost:3000` 并确认应用正常加载，能够：
- 显示物品列表
- 打开添加物品弹窗
- 执行搜索和筛选

### 3. 检查构建日志
部署后在 Vercel 仪表板中：
- 前往 **Deployments** 标签
- 点击最新部署
- 检查 **Build Logs** - 应该没有错误，只有警告是可接受的
- 检查 **Function Logs** - API 调用时不应有错误

### 4. 确认部署状态
- ✅ 部署状态为"Ready"（绿色勾号）
- ✅ 域名正确绑定到该部署
- ✅ 再次访问自定义域名，应该显示应用

## 如果仍然看到 404

### 情况 1: 仍然是 `DEPLOYMENT_NOT_FOUND`
- 等待 2-3 分钟，确保部署完全完成
- 尝试在 Vercel 仪表板中重新部署：Deployments → 右键点击最新版本 → Redeploy

### 情况 2: 页面打开但显示错误
- 打开浏览器开发者工具（F12）
- 检查 **Console** 标签 - 查看是否有错误信息
- 检查 **Network** 标签 - 查看 API 调用 (`/api/items`) 是否返回 5xx 错误
- 在 Vercel 仪表板的 Function Logs 中查看详细错误

### 情况 3: API 调用返回 500 错误
最可能的原因：`DATABASE_URL` 环境变量未正确设置

**检查方法**:
```bash
# 在本地查看环境变量
echo $DATABASE_URL

# 如果为空，从 Vercel 仪表板复制并在 .env.local 中设置
```

## 概念理解

### Neon 客户端生命周期
```
初始化 (一次)
    ↓
neon(DATABASE_URL) → SQL 客户端对象
    ↓
复用 (多次调用)
    ↓
await sql`SELECT * FROM items`
await sql`INSERT INTO items VALUES (...)`
```

### 参数化查询的正确方式（Neon）
```typescript
// 方式 1: 模板字符串（推荐）- 自动处理参数
const result = await sql`SELECT * FROM items WHERE id = ${id}`;

// 方式 2: 手动参数 - 需要使用扩展运算符
const result = await sql('SELECT * FROM items WHERE id = $1', id);
const result = await sql('SELECT * FROM items WHERE id = $1', ...params);
```

### 部署失败的常见原因链
```
环境变量缺失
    ↓
应用启动时崩溃
    ↓
Vercel 标记构建为失败
    ↓
部署 ID 无效
    ↓
DEPLOYMENT_NOT_FOUND 错误
```

## 预防将来的问题

1. **本地开发时启用严格检查**
   ```bash
   npm run build  # 在本地运行完整构建，检查所有错误
   ```

2. **使用 TypeScript 严格模式**
   - 确保 `tsconfig.json` 中启用 `"strict": true`
   - 这会在开发时捕获许多错误

3. **为关键功能添加监控**
   - 在 Vercel Analytics 中监控 API 错误率
   - 订阅部署失败通知

4. **定期测试环境变量**
   - 部署前检查 Vercel 仪表板中的环境变量
   - 确保 Production 环境有所有必要的变量

## 相关文档

- [Neon JavaScript Driver](https://neon.tech/docs/connect/connect-from-nodejs)
- [Next.js API Routes Error Handling](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#error-handling)
- [Vercel Deployment Troubleshooting](https://vercel.com/docs/deployments/troubleshoot-a-deployment)
