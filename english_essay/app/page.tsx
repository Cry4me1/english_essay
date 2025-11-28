"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, GitMerge, Sparkles, PenTool, Zap, BookOpen, ChevronRight } from "lucide-react";
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
  "AI 生成": <Sparkles className="h-5 w-5" />,
  "深度批改": <GitMerge className="h-5 w-5" />,
  "沉浸式编辑": <PenTool className="h-5 w-5" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-24"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="perspective-container"
      >
        <div className="neu-float p-8 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 badge-accent"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Focus Mode · Gemini Ready</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="serif text-4xl font-medium leading-tight md:text-5xl lg:text-6xl"
                >
                  <span className="gradient-text">Write better,</span>
                  <br />
                  <span>faster.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl"
                  style={{ color: "var(--muted)" }}
                >
                  沉浸式英语写作与批改工作台，AI 驱动的学术写作助手。
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                结合 Next.js 14 + Supabase + Gemini 3 的产品蓝图已就绪。
                当前版本使用 mock JSON 演示完整流程，可浏览落地页、仪表盘与工作台体验。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/write">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="neu-button-accent inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    立即体验工作台
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.div>
                </Link>
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="neu-button inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium"
                  >
                    <BookOpen className="h-4 w-4" />
                    查看仪表盘
                  </motion.div>
                </Link>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 sm:grid-cols-3"
              >
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="neu-raised p-5 cursor-default card-3d"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                      {stat.label}
                    </p>
                    <p className="serif text-2xl font-medium mt-1" style={{ color: "var(--accent)" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      {stat.hint}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Code Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <div className="glass-dark rounded-3xl p-6 animate-float">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-xs text-white/50 ml-2">Mock JSON · /api/correct</span>
                </div>
                <pre className="overflow-hidden rounded-2xl bg-black/40 p-4 text-xs leading-relaxed text-emerald-300/90 font-mono">
                  <code>{previewJson}</code>
                </pre>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    * 数据来自 mockData.ts
                  </span>
                  <div className="badge-accent text-[10px]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    Live Preview
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div 
                className="absolute -z-10 -top-4 -right-4 h-full w-full rounded-3xl"
                style={{ background: "var(--accent-glow)", filter: "blur(40px)", opacity: 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={itemVariants}
        className="space-y-8"
      >
        <div className="text-center space-y-3">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--muted)" }}
          >
            核心能力
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="serif text-3xl md:text-4xl"
          >
            三大闭环功能
          </motion.h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 perspective-container">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="neu-float p-6 card-3d group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="icon-container h-12 w-12 transition-all duration-300 group-hover:shadow-lg"
                  style={{ 
                    background: "linear-gradient(145deg, var(--accent-light), var(--accent))",
                    color: "white"
                  }}
                >
                  {iconMap[card.title] ?? <Sparkles className="h-5 w-5" />}
                </motion.div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                {card.description}
              </p>
              <ul className="space-y-2">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                    <ChevronRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Workflow Section */}
      <motion.section
        variants={itemVariants}
        className="space-y-8"
      >
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>
            产品流程
          </p>
          <h2 className="serif text-3xl md:text-4xl">MVP 体验路径</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="neu-raised p-5 group cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold text-white"
                    style={{ background: "linear-gradient(145deg, var(--accent-light), var(--accent))" }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{step.title.replace(/^\d+\.\s*/, '')}</span>
                </div>
                <span className="badge-neu text-xs">
                  {step.duration}
                </span>
              </div>
              <p className="text-sm pl-11" style={{ color: "var(--muted)" }}>
                {step.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Presets Section */}
      <motion.section
        variants={itemVariants}
        className="space-y-8"
      >
        <div className="neu-float p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>
                预设题库
              </p>
              <h2 className="serif text-3xl">Generator Presets</h2>
            </div>
            <Link href="/write">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="neu-button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
              >
                查看更多
                <ArrowUpRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {assistantPresets.map((preset, index) => (
              <motion.div
                key={preset.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="neu-inset p-5 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">{preset.title}</p>
                  <ChevronRight 
                    className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" 
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-neu text-[10px]">{preset.tone}</span>
                  <span className="badge-neu text-[10px]">{preset.words} words</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {preset.excerpt}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={itemVariants}
        className="text-center"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="neu-float p-10 md:p-14 animate-pulse-glow"
        >
          <h2 className="serif text-3xl md:text-4xl mb-4">
            准备好提升你的写作了吗？
          </h2>
          <p className="text-sm mb-8 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            立即开始使用 AI 驱动的写作工具，体验沉浸式的创作与批改流程。
          </p>
          <Link href="/write">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="neu-button-accent inline-flex items-center gap-3 px-8 py-4 text-base font-medium"
            >
              <Sparkles className="h-5 w-5" />
              开始免费创作
              <ArrowUpRight className="h-5 w-5" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
