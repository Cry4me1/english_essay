import Link from "next/link";
import { ArrowUpRight, GitMerge, Sparkles } from "lucide-react";
import {
  assistantPresets,
  correctionPayload,
  featureCards,
  heroStats,
  workflowSteps,
} from "@/lib/mockData";

const previewJson = JSON.stringify(correctionPayload, null, 2)
  .split("\n")
  .slice(0, 14)
  .join("\n");

const iconMap: Record<string, JSX.Element> = {
  "AI 生成": <Sparkles className="h-4 w-4" />,
  "深度批改": <GitMerge className="h-4 w-4" />,
  "沉浸式编辑": <ArrowUpRight className="h-4 w-4" />,
};

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="grid gap-8 rounded-3xl border border-black/10 bg-white/90 p-8 shadow-sm md:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">
            Focus Mode · Gemini Ready
          </p>
          <h1 className="serif text-4xl font-medium leading-tight text-black md:text-5xl">
            Write better, faster. 沉浸式英语写作与批改工作台。
          </h1>
          <p className="text-sm text-black/70 md:text-base">
            结合 Next.js 14 + Supabase + Gemini 3 的产品蓝图已就绪。当前版本使用
            mock JSON 演示完整流程，可浏览落地页、仪表盘与工作台体验。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
            >
              立即体验工作台
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-2.5 text-sm font-medium"
            >
              查看仪表盘
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/10 bg-[#f7f7f2] p-4 text-sm"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  {stat.label}
                </p>
                <p className="serif text-2xl text-black">{stat.value}</p>
                <p className="text-xs text-black/60">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#050505] p-6 text-sm text-white">
          <p className="text-xs text-white/60">Mock JSON · /api/correct</p>
          <pre className="mt-4 overflow-hidden rounded-xl bg-black/40 p-4 text-xs leading-relaxed">
            {previewJson}
          </pre>
          <p className="mt-4 text-xs text-white/70">
            * 当前版本仅展示前端流程，JSON 数据来自 `mockData.ts`。
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            核心能力
          </p>
          <h2 className="serif text-3xl text-black">三大闭环功能</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20">
                  {iconMap[card.title] ?? <Sparkles className="h-4 w-4" />}
                </span>
                {card.title}
              </div>
              <p className="text-sm text-black/70">{card.description}</p>
              <ul className="text-xs text-black/60">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="leading-relaxed">
                    · {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            产品流程
          </p>
          <h2 className="serif text-3xl text-black">MVP 体验路径</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {workflowSteps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black">{step.title}</span>
                <span className="text-xs text-black/50">{step.duration}</span>
              </div>
              <p className="text-sm text-black/70">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-black/10 bg-white/80 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            预设题库
          </p>
          <h2 className="serif text-3xl text-black">Generator Presets</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {assistantPresets.map((preset) => (
            <div
              key={preset.title}
              className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-[#f7f7f2] p-4"
            >
              <p className="text-sm font-semibold">{preset.title}</p>
              <p className="text-xs text-black/50">
                Tone: {preset.tone} · {preset.words} words
              </p>
              <p className="text-sm text-black/70">{preset.excerpt}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
