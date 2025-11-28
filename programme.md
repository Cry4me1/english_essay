产品需求文档 (PRD) - AI 英语作文创作与批改平台

版本: v1.1
状态: 规划中
更新日期: 2024-05-20

1. 产品概述 (Product Overview)

1.1 产品愿景

构建一个“沉浸式”且“智能化”的英语写作辅助环境。区别于传统的翻译软件，本平台专注于长文本（Essay）的逻辑构建、学术润色和深度批改，帮助雅思/托福考生及英语学习者提升写作能力。

1.2 目标用户 (User Personas)

备考学生 (IELTS/TOEFL): 需要针对特定题型（如 Argument, Graphic）的高分范文和严格评分。

学术写作者: 需要学术词汇替换和逻辑连贯性检查。

英语爱好者: 希望通过日常写作练习保持语感。

2. UI/UX 设计规范 (Design Guidelines)

2.1 设计语言 (Design System)

采用 "Focus Mode" (专注模式) 设计理念，减少视觉干扰。

UI 框架: Shadcn/ui + Tailwind CSS。

字体: Inter (UI) + Noto Serif (正文阅读/写作区域，增强书卷气)。

图标库: Lucide React。

2.2 配色方案 (Color Palette)

主色调 (Primary): Slate-900 (深岩灰) - 用于主按钮、强调文字。

强调色 (Accent): Indigo-600 (靛蓝) - 用于 AI 激活状态、高分提示。

功能色:

🔴 错误/删除: Red-500/10 (浅红背景深红文字)

🟢 建议/新增: Emerald-500/10 (浅绿背景深绿文字)

🟡 优化/替换: Amber-500/10 (浅黄背景深黄文字)

背景色: Slate-50 (极淡灰) - 用于大背景，避免纯白刺眼。

3. 核心界面与交互流程 (Key Screens & Flows)

3.1 落地页 (Landing Page)

Hero Section: 极简设计，左侧为 Slogan ("Write Better, Faster")，右侧为动态演示 GIF（展示 AI 实时修改过程）。

功能卡片: 展示 "AI 生成"、"智能批改"、"知识库" 三大核心功能。

CTA 按钮: "Start Writing for Free" (引导至注册/登录)。

3.2 仪表盘 (Dashboard) - /dashboard

布局: 侧边栏导航 + 右侧内容区。

核心模块:

写作统计: 这是一个热力图组件 (类似 GitHub Contributions)，展示用户过去一年的写作频率。

最近文档: 卡片式布局，每张卡片显示：标题、上次修改时间、AI 评分徽章（如 "Band 7.0"）。

生词本入口: 快速复习收藏的单词。

3.3 核心工作台 (The Workbench) - /write

这是产品的灵魂页面，采用 左右分栏 (Split View) 布局。

A. 左侧：沉浸式编辑器 (Editor)

UI: 极简的 Textarea 或 Tiptap 编辑器，无复杂工具栏。

顶部: 输入标题。

底部: 字数统计、预计阅读时间。

交互:

输入时隐藏所有侧边栏，进入全屏专注模式。

选中文本时弹出 "Floating Menu" (悬浮菜单): [Ask AI], [Translate], [Synonyms]。

B. 右侧：AI 助手面板 (AI Assistant Panel)

此面板有两个 Tab 模式：

生成模式 (Generator Mode):

表单: 输入 Topic, Tone, Word Count。

流式输出: 文字逐字出现，带有打字机光标效果。

操作: "Insert to Editor" (一键插入左侧)。

批改模式 (Correction Mode) - 核心交互:

评分仪表盘: 顶部显示总分及雷达图 (词汇, 语法, 逻辑, 连贯性)。

Diff 视图:

不直接覆盖原文，而是以高亮气泡形式展示建议。

点击左侧编辑器中的高亮句子，右侧面板自动滚动到对应的 AI 评语卡片 (Scroll-to-view)。

Accept/Reject: 每个修改建议都有 ✅ 和 ❌ 按钮，点击 ✅ 则自动替换左侧文本。

3.4 移动端适配 (Mobile Responsiveness)

由于手机屏幕限制，工作台取消左右分栏。

底部导航: 使用 Tabs 切换 [Editor] 和 [AI Feedback]。

批改交互: 在 Editor 模式下，有修改建议的句子下方显示下划线，点击后从底部弹出 Drawer (抽屉) 显示修改详情。

4. 功能需求 (Functional Requirements)

4.1 核心功能 - 智能写作 (AI Generation)

用户输入: 题目、目标分数 (如雅思7分)、语气 (学术/口语)。

后端处理: 调用 Gemini 3 API。

输出要求: 必须包含 Introduction, Body, Conclusion 结构。

UI 表现: 支持流式输出 (Streaming)，减少等待焦虑。

4.2 核心功能 - 深度批改 (Deep Correction)

触发: 用户点击 "Analyze" 按钮。

分析维度:

语法错误: 时态、主谓一致 (强制纠正)。

词汇升级: 将 "good" 建议改为 "compelling" 或 "advantageous" (建议性)。

逻辑连贯: 分析段落之间是否有过渡词。

数据结构: AI 返回 JSON 数据，包含原文位置索引、错误类型、修改建议。

4.3 辅助功能 - 上下文词典

交互: 用户在查看 AI 范文时，双击任意单词。

响应: 弹出 Popover，显示中文释义、音标、以及 AI 生成的当前语境下的例句。

动作: 只有 "Add to Vocabulary" 按钮，保存至 Supabase。

5. 技术架构实现 (Technical Implementation)

基于之前确定的技术栈，结合新的 UI 需求进行细化。

5.1 技术栈 (Tech Stack)

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui (新增), Framer Motion (新增，用于动画)。

Backend: Supabase (Auth, DB, Realtime)。

AI Engine: Google Gemini 3 / 1.5 Pro (via Vercel AI SDK)。

State Management: Zustand (用于管理 Editor 和 AI Panel 的联动状态)。

5.2 数据库模型 (Schema Update)

保持原有的 profiles 和 essays 表，新增 vocabulary 表支持 UI 中的生词本功能。

-- 新增：生词本表
create table public.vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  definition text, -- 中文释义
  context_sentence text, -- 收藏时的例句
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vocabulary enable row level security;
create policy "Users can manage own vocabulary" on vocabulary for all using (auth.uid() = user_id);


5.3 API 接口策略 (Gemini 3 Integration)

批改接口优化 (POST /api/correct):
为了配合 UI 的 "Diff 视图"，Prompt 需要强制返回具体的 JSON 结构。

// 伪代码逻辑
const prompt = `
Analyze the following essay. Return a strictly valid JSON object.
Do NOT use Markdown formatting in the response.
Structure:
{
  "score": number,
  "summary": "string",
  "annotations": [
    {
      "original_text": "string (exact match from source)",
      "type": "grammar" | "vocabulary" | "logic",
      "suggestion": "string",
      "reason": "string"
    }
  ]
}
Essay: ${userContent}
`;

// 使用 Gemini json mode
const result = await generateObject({
  model: google('gemini-1.5-pro', { structuredOutputs: true }), // 或 gemini-3
  schema: correctionSchema, // 使用 Zod 定义 schema
  prompt: prompt,
});


6. 开发路线图 (Roadmap)

Phase 1: MVP (核心闭环)

完成 Next.js + Supabase 基础搭建。

实现 /login 和 /dashboard。

实现 /write 页面的基础左右分栏。

接入 Gemini API 实现基础的生成与 JSON 格式的批改。

Phase 2: 体验升级 (UI/UX)

引入 Shadcn 组件库美化界面。

实现流式打字机效果。

实现 Diff 算法，在前端精准高亮错误位置。

移动端适配。

Phase 3: 知识沉淀

生词本功能 (划词翻译 + 收藏)。

写作历史版本回溯。

数据统计图表。