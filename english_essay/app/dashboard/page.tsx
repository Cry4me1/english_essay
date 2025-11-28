"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarRange, FilePenLine } from "lucide-react";
import {
  dashboardHeatmap,
  dashboardStats,
  recentDocuments,
  vocabularySet,
} from "@/lib/mockData";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const groupedHeatmap = Array.from({ length: 4 }, (_, weekIndex) =>
  dashboardHeatmap.filter((cell) => cell.week === weekIndex)
);

const colors = [
  "rgba(0,0,0,0.04)",
  "rgba(0,0,0,0.12)",
  "rgba(0,0,0,0.24)",
  "rgba(0,0,0,0.45)",
  "rgba(0,0,0,0.8)",
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/90 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Dashboard
          </p>
          <h1 className="serif text-3xl text-black">写作仪表盘</h1>
          <p className="text-sm text-black/70">
            统计数据均来自 `mockData.ts`，用于演示 Band 分、热力图与最近文档。
          </p>
        </div>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-medium"
        >
          前往工作台
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/10 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              {stat.label}
            </p>
            <p className="serif text-2xl text-black">{stat.value}</p>
            <p className="text-xs text-black/60">{stat.trend}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                写作热力图
              </p>
              <p className="text-sm text-black/60">
                过去四周的写作频率，色阶越深表示字数越多。
              </p>
            </div>
            <CalendarRange className="h-5 w-5 text-black/60" />
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col gap-6 text-xs text-black/40">
              {dayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {groupedHeatmap.map((week, index) => (
                <div key={week[0]?.week ?? index} className="grid gap-2">
                  {week
                    .slice()
                    .sort((a, b) => a.day - b.day)
                    .map((cell) => (
                      <motion.div
                        key={cell.id}
                        className="h-8 w-10 rounded-lg border border-black/10"
                        style={{
                          backgroundColor: colors[cell.intensity],
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                生词本
              </p>
              <p className="text-sm text-black/60">共 {vocabularySet.length} 个单词</p>
            </div>
            <FilePenLine className="h-5 w-5 text-black/60" />
          </div>
          <div className="mt-6 space-y-4">
            {vocabularySet.map((item) => (
              <div
                key={item.word}
                className="rounded-2xl border border-black/10 bg-[#f7f7f2] p-4 text-sm"
              >
                <p className="font-medium">{item.word}</p>
                <p className="text-xs text-black/60">{item.definition}</p>
                <p className="mt-2 text-sm text-black/70">{item.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                最近文档
              </p>
              <p className="text-sm text-black/60">
                点击任一条目即可跳转至工作台继续编辑。
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-black/60" />
          </div>
          <div className="mt-4 divide-y divide-black/10">
            {recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                href="/write"
                className="flex flex-col gap-1 py-4 transition hover:opacity-80"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">{doc.title}</p>
                  <span className="rounded-full border border-black/20 px-2 py-0.5 text-xs">
                    Band {doc.band}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-black/60">
                  <span>{doc.updatedAt}</span>
                  <span>{doc.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            洞察 & 建议
          </p>
          <p className="serif mt-2 text-2xl text-black">
            逻辑得分持续拉升，建议把注意力放在语法一致性。
          </p>
          <p className="mt-2 text-sm text-black/70">
            根据 mock 数据，近三次批改的语法平均分 6.3，主要集中在主谓一致与定冠词缺失。
            建议在工作台使用浮动菜单的 Ask AI 模块生成语法检查列表。
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-black/20 p-4 text-xs text-black/60">
            数据说明：所有指标使用 `mockData.ts` 提供的 JSON
            对象，便于后续替换成真实 API 响应。
          </div>
        </div>
      </section>
    </div>
  );
}

