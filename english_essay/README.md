## 项目简介

AI 英语作文平台旨在为雅思/托福等长篇写作场景提供“创作 + 批改”闭环体验。技术栈基于 Next.js 16（App Router）、Tailwind CSS v4、Shadcn/UI、Supabase 以及 Gemini 3。

## 环境准备

1. 安装依赖

   ```bash
   npm install
   ```

   初次安装会同步引入 `ai @ai-sdk/google zustand @supabase/supabase-js @supabase/ssr lucide-react framer-motion zod` 以及 Shadcn 所需的样式依赖。

2. 复制环境变量模板并填写真实值

   ```bash
   cp env.local.template .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名 Key  
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini 1.5/3 API Key

3. Supabase 数据库

   打开 Supabase SQL Editor，执行 `supabase/schema.sql` 中的语句，创建 `profiles / essays / vocabulary` 三张核心表以及相应的 RLS 策略和触发器。

4. Shadcn/UI

   已使用 `npx shadcn@latest init` 完成初始化，并预置 `button, textarea, card, tabs, scroll-area, sheet, separator` 组件。后续如需新增组件，可运行：

   ```bash
   npx shadcn@latest add <component-name>
   ```

## 开发调试

```bash
npm run dev
```

在浏览器访问 [http://localhost:3000](http://localhost:3000)。字体在 `app/layout.tsx` 中配置了 `Inter`（UI）与 `Noto Serif`（正文），确保与 PRD 的视觉要求一致。
