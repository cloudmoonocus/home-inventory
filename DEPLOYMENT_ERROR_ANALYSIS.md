# DEPLOYMENT_NOT_FOUND 错误 - 完整分析

## 你的问题分析

你问："是不是需要新建一个 vercel.json，然后把所有的路径都重定向到默认路径 /，然后让 router 去解析？"

**答案: 不需要。** 这是对 Next.js 工作方式的误解。实际问题不是路由配置，而是部署本身失败了。

---

## 1. 建议的修复 (Fix)

### 问题的真正原因
你的应用在 Vercel 部署时崩溃了，原因是：

```
数据库连接错误 → API 路由初始化失败 → 构建过程异常 → 部署标记为失败 → DEPLOYMENT_NOT_FOUND
```

### 立即采取的行动
已修复以下问题：

1. **Neon 客户端初始化错误**
   - 之前每次请求都创建新连接，这是错误的
   - 现在在模块加载时创建一次，所有请求复用

2. **参数化查询语法错误**
   - 之前混合使用数组和字符串参数，导致 SQL 执行失败
   - 现在正确使用扩展运算符传递参数

3. **缺乏错误处理**
   - 所有 API 路由现在有 try-catch，能正确返回错误信息
   - 这样 Vercel 能识别问题而不是简单地标记部署失败

4. **配置问题**
   - 移除了 `ignoreBuildErrors: true`，这会隐藏构建时的真实错误
   - 添加了严格的 TypeScript 检查

### 需要的最后一步
**在 Vercel 仪表板中设置环境变量**:
- 前往 Settings → Environment Variables
- 添加 `DATABASE_URL` = 你的 Neon 连接字符串
- 触发重新部署

---

## 2. 根本原因解释 (Root Cause)

### 为什么会发生这个错误？

#### 错误发生的条件链
```
1. 应用代码有问题（数据库连接、API 路由）
        ↓
2. Vercel 尝试构建应用失败
        ↓
3. 构建过程异常结束
        ↓
4. Vercel 无法创建有效的部署
        ↓
5. 部署 ID 无效，请求该部署时返回 404
        ↓
6. 显示：DEPLOYMENT_NOT_FOUND
```

#### 为什么 `vercel.json` 路由重写不会解决这个问题
- 路由重写是给 **已成功部署** 的应用使用的
- 如果部署本身失败了（DEPLOYMENT_NOT_FOUND），没有服务器来执行路由重写
- 就像房子没有建好，你不能通过改变门牌号来解决问题

#### 具体的代码问题

**问题 1: Neon 连接方式错误**
```typescript
// ❌ 错误 - 每次调用都创建新连接
export function getDb() {
  return neon(process.env.DATABASE_URL!);  // 调用时创建
}

// 为什么错误:
// - neon() 函数很重，不应该每次都调用
// - 连接不会重用，效率低
// - 可能导致连接池耗尽
```

**问题 2: 参数查询方式错误**
```typescript
// ❌ 错误 - 混合使用不兼容的 API
let query = `SELECT * FROM items WHERE id = $${paramIndex}`;
const params = [id];
await sql(query, params);  // sql() 是函数调用形式

// ✅ 正确 - 使用扩展运算符
await sql(query, ...params);  // 展开参数
// 或使用模板字符串（推荐）
await sql`SELECT * FROM items WHERE id = ${id}`;
```

**问题 3: 缺乏错误处理**
```typescript
// ❌ 错误 - 未捕获的异常
export async function GET() {
  const sql = getDb();
  const items = await sql`SELECT * FROM items`;  // 如果失败，整个函数崩溃
  return NextResponse.json(items);
}

// ✅ 正确 - 捕获异常
export async function GET() {
  try {
    const sql = getDb();
    const items = await sql`SELECT * FROM items`;
    return NextResponse.json(items);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### 你的误解

你认为问题是 **前端路由没有正确配置**，但实际上：

- Next.js App Router 默认就支持客户端路由
- 每个文件自动成为路由（`app/page.tsx` → `/`）
- 不需要额外的 `vercel.json` 路由规则
- 问题发生在 **部署/构建阶段**，不是运行时

---

## 3. 教学 - 概念理解 (Teaching)

### 概念 1: Next.js 服务器组件与 API 路由的初始化顺序

```
应用启动
    ↓
next.config.mjs 执行
    ↓
所有 app/ 文件被编译
    ↓
API 路由中的顶级代码执行（包括 getDb()）
    ↓
如果任何 API 路由的顶级代码失败 → 构建失败
    ↓
部署标记为失败
```

这就是为什么 `getDb()` 的实现很关键 - 它在构建时被验证。

### 概念 2: Serverless 函数与连接池

在 Vercel 上，每个 API 路由都是一个独立的 Serverless 函数：

```
请求来临
    ↓
新的 JavaScript 运行时启动
    ↓
getDb() 被调用
    ↓
SQL 连接创建
    ↓
查询执行
    ↓
函数结束，连接关闭
```

**如果每次都创建新连接**：
- 性能差（每个请求都要建立 TCP 连接）
- 连接池可能耗尽
- 数据库过载

**正确的做法**：
- 在模块加载时创建一次连接
- Serverless 函数保持连接存活（在函数执行期间）
- 一个函数多次查询可复用同一连接

### 概念 3: 环境变量的可见性

```
Vercel 构建时
    ↓
检查环境变量并注入代码
    ↓
如果 DATABASE_URL 缺失：
  - 代码中的 process.env.DATABASE_URL 为 undefined
  - 执行 neon(undefined) → 异常
  - 构建失败
    ↓
如果 DATABASE_URL 存在：
  - 代码中的 process.env.DATABASE_URL 为连接字符串
  - 执行 neon("postgresql://...") → 成功
  - 部署成功
```

这就是为什么你必须在 Vercel 仪表板中设置环境变量，而不是在本地 `.env.local` 中。

### 概念 4: 错误处理的分层

```
构建阶段错误（编译时）
├─ TypeScript 类型错误
├─ 导入不存在的模块
└─ 顶级代码异常（getDb() 初始化）

运行时错误（请求时）
├─ 数据库连接失败
├─ 查询执行失败
└─ 业务逻辑错误
```

通过添加 try-catch，我们将某些错误从"构建阶段"转移到"运行时"，这样部署能成功，但 API 会返回 500 错误，你能看到真实的错误信息。

---

## 4. 警告信号 - 将来如何识别 (Warning Signs)

### 模式 1: 缺少 try-catch 的数据库调用
```typescript
❌ 危险信号：
export async function GET() {
  const data = await sql`SELECT * FROM table`;
  return NextResponse.json(data);
}

✅ 正确做法：
export async function GET() {
  try {
    const data = await sql`SELECT * FROM table`;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

### 模式 2: 重复的连接初始化
```typescript
❌ 危险信号：
export function getDb() {
  return neon(process.env.DATABASE_URL);  // 每次调用都新建
}

// 使用：
const sql = getDb();  // 第 1 次连接
const sql2 = getDb(); // 第 2 次连接
```

### 模式 3: 忽视环境变量错误
```typescript
❌ 危险信号：
const url = process.env.DATABASE_URL;  // 可能是 undefined
const client = neon(url);

✅ 正确做法：
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 环境变量未设置");
}
const client = neon(process.env.DATABASE_URL);
```

### 模式 4: 隐藏构建错误
```typescript
❌ 极度危险：
// next.config.js
{
  typescript: {
    ignoreBuildErrors: true  // ← 永远不要这样做！
  }
}
```

### 模式 5: 忽视构建日志
```
❌ 错误做法：
- 部署失败了，但不查看日志
- 假设问题在代码某处，随意尝试修复

✅ 正确做法：
- 始终查看 Vercel 仪表板的 Build Logs
- 最后一条错误信息通常就是根本原因
- 修复日志中的错误，而不是猜测
```

---

## 5. 替代方案对比 (Alternatives)

### 你提议的方案：vercel.json 路由重写
```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/"
    }
  ]
}
```

| 方案 | 优点 | 缺点 | 何时使用 |
|------|------|------|---------|
| **vercel.json 路由重写** | 简单配置，SPA 友好 | 只在部署**成功后**有效 | SPA 应用，需要客户端路由 |
| **Next.js App Router** | 原生支持，无需配置 | 需要正确的文件结构 | 标准 Next.js 应用（你的情况） |
| **环境变量修复** | 解决根本问题 | 需要访问 Vercel 仪表板 | 解决 DEPLOYMENT_NOT_FOUND |
| **错误处理** | 显示有意义的错误 | 需要修改代码 | 所有生产应用 |

对你来说，**环境变量修复 + 错误处理** 是唯一正确的方案，因为问题发生在部署阶段。

### 为什么不能用 vercel.json 路由重写
```
部署失败 → 没有服务器来执行 vercel.json 规则 → 路由重写不会运行
```

你必须**先让部署成功**，然后才能考虑路由配置。

---

## 6. 最终检查清单

- [ ] 在 Vercel 仪表板中设置 `DATABASE_URL` 环境变量
- [ ] 查看最新部署的 Build Logs，确认没有错误
- [ ] 访问应用，检查 API 调用是否成功（Browser DevTools → Network）
- [ ] 如果 API 返回 500，查看 Function Logs 获取详细错误
- [ ] 等待 5-10 秒让 DNS 生效，然后访问自定义域名

---

## 快速故障排除

| 症状 | 原因 | 解决方案 |
|------|------|---------|
| DEPLOYMENT_NOT_FOUND | 部署失败 | 检查 Build Logs |
| 页面加载但 API 返回 500 | 数据库连接失败 | 检查 DATABASE_URL 环境变量 |
| 数据库查询失败 | Neon 连接有问题 | 检查连接字符串格式 |
| 部分 API 有效，部分无效 | 参数化查询错误 | 检查 SQL 参数传递方式 |
| 本地工作，生产崩溃 | 环境变量不匹配 | 同步 .env.local 和 Vercel 变量 |
