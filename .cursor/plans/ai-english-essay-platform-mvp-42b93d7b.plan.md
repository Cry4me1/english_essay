<!-- 42b93d7b-c333-4846-8a70-cccaa74bacfd c520222d-7596-4d6e-8260-d944223ad697 -->
# AI 英语作文平台 MVP 实施计划

基于 `programme.md`，本计划侧重于交付 **Phase 1: MVP (核心闭环)** 并为 **Phase 2 (UI/UX)** 奠定基础。

## 1. 环境与依赖配置 (Environment & Dependencies)

初始化项目，安装 UI、状态管理和 AI 相关的核心库。

-   **安装核心依赖**:
    -   `ai @ai-sdk/google`: 用于 Gemini 集成。
    -   `zustand`: 用于全局状态管理 (编辑器 <-> AI 面板联动)。
    -   `@supabase/supabase-js @supabase/ssr`: 用于后端与认证。
    -   `lucide-react`: 图标库。
    -   `framer-motion`: 动画库。
    -   `zod`: Schema 验证。
-   **初始化 Shadcn UI**:
    -   运行 `npx shadcn@latest init` 配置组件系统。
    -   安装初始组件: `button`, `textarea`, `card`, `tabs`, `scroll-area`, `sheet` (移动端抽屉), `separator`。

## 2. 基础设施配置 (Infrastructure)

-   **环境变量**: 创建 `.env.local` 配置:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `GOOGLE_GENERATIVE_AI_API_KEY`
-   **Supabase 设置**:
    -   创建 `utils/supabase/server.ts` 和 `client.ts` 客户端。
    -   **数据库**: 提供 SQL 以创建 `profiles` (用户信息), `essays` (作文), 和新增的 `vocabulary` (生词本) 表。
-   **字体**: 在 `app/layout.tsx` 中配置 `Inter` (UI) 和 `Noto Serif` (正文)。

## 3. 核心功能：工作台 (The Workbench - `/write`)

产品的核心页面。

-   **状态存储 (`store/useWorkbenchStore.ts`)**:
    -   管理 `content` (作文文本)。
    -   管理 `isGenerating` (加载状态)。
    -   管理 `aiPanelMode` ('generate' | 'correct')。
-   **布局**: 创建 `app/write/page.tsx`，采用左右分栏布局 (使用 Resizable Panel 或 Flexbox)。
-   **左侧面板 (编辑器)**:
    -   极简 Textarea/Editor 组件。
    -   "悬浮菜单" 占位符。
-   **右侧面板 (AI 助手)**:
    -   **Tab 1: 生成模式**: 表单输入 (题目, 语气) -> 触发生成。
    -   **Tab 2: 批改模式**: 展示分析结果 (评分, 反馈建议)。

## 4. AI 后端集成 (AI Integration)

-   **生成 API (`app/api/generate/route.ts`)**:
    -   使用 Vercel AI SDK 的 `streamText` 实现流式响应。
-   **批改 API (`app/api/correct/route.ts`)**:
    -   使用 `generateObject` 和 Zod schema 强制返回符合前端 "Diff 视图" 要求的 JSON 结构。

## 5. 次级页面 (Secondary Pages)

-   **落地页 (`/`)**: 极简 Hero 区域，带 "Start Writing" CTA。
-   **仪表盘 (`/dashboard`)**:
    -   基础侧边栏布局。
    -   "最近文档" 列表占位符。

## 6. 认证 (Auth)

-   **登录页 (`/login`)**: 使用 Supabase Auth 实现简单的邮箱/密码登录或 Magic Link。

### To-dos

- [ ] Install dependencies (shadcn, ai, supabase, zustand, etc.) and init Shadcn
- [ ] Configure Environment Variables and Supabase Clients
- [ ] Apply Database Schema (SQL) for tables
- [ ] Implement Global Layout & Fonts (Inter/Noto Serif)
- [ ] Develop Workbench State Store (Zustand)
- [ ] Build Workbench UI (/write) - Split View Editor & AI Panel
- [ ] Implement AI Generation API (Streaming)
- [ ] Implement AI Correction API (Structured Output)
- [ ] Connect UI to AI APIs