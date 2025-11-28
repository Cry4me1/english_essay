"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  CalendarRange, 
  FilePenLine, 
  TrendingUp, 
  Clock, 
  Zap, 
  BookOpen,
  ChevronRight,
  Lightbulb
} from "lucide-react";
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

// 新拟态风格的颜色渐变
const getIntensityStyle = (intensity: number) => {
  const styles = [
    { 
      background: "var(--background)", 
      boxShadow: "inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light)" 
    },
    { 
      background: "rgba(91, 95, 199, 0.15)", 
      boxShadow: "2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)" 
    },
    { 
      background: "rgba(91, 95, 199, 0.35)", 
      boxShadow: "3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)" 
    },
    { 
      background: "rgba(91, 95, 199, 0.55)", 
      boxShadow: "4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)" 
    },
    { 
      background: "linear-gradient(145deg, var(--accent-light), var(--accent))", 
      boxShadow: "5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light), 0 0 15px var(--accent-glow)" 
    },
  ];
  return styles[intensity] || styles[0];
};

const statIcons: Record<string, React.ReactNode> = {
  "当前水平": <TrendingUp className="h-5 w-5" />,
  "累计字数": <FilePenLine className="h-5 w-5" />,
  "持续天数": <Clock className="h-5 w-5" />,
  "AI 会话": <Zap className="h-5 w-5" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.section
        variants={itemVariants}
        className="neu-float p-6 md:p-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="badge-accent text-[10px]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Dashboard
              </div>
            </div>
            <h1 className="serif text-3xl md:text-4xl">写作仪表盘</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              统计数据均来自 mockData.ts，用于演示 Band 分、热力图与最近文档。
            </p>
          </div>
          <Link href="/write">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="neu-button-accent inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
            >
              前往工作台
              <ArrowUpRight className="h-4 w-4" />
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="neu-raised p-5 cursor-default card-3d group"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
              <div 
                className="icon-container h-8 w-8 transition-all duration-300 group-hover:scale-110"
                style={{ color: "var(--accent)" }}
              >
                {statIcons[stat.label]}
              </div>
            </div>
            <p className="serif text-3xl font-medium" style={{ color: "var(--accent)" }}>
              {stat.value}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              {stat.trend}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Heatmap Section */}
        <motion.section
          variants={itemVariants}
          className="neu-float p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5" style={{ color: "var(--accent)" }} />
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  写作热力图
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                过去四周的写作频率，色阶越深表示字数越多
              </p>
            </div>
            <div className="badge-neu text-xs">
              近 28 天
            </div>
          </div>

          <div className="neu-inset p-6 rounded-2xl">
            <div className="grid gap-3" style={{ gridTemplateColumns: "auto 1fr" }}>
              {/* Day Labels */}
              <div className="flex flex-col gap-2 pr-4">
                {dayLabels.map((label) => (
                  <div 
                    key={label} 
                    className="h-10 flex items-center text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-4 gap-3">
                {groupedHeatmap.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-2">
                    {week
                      .slice()
                      .sort((a, b) => a.day - b.day)
                      .map((cell, cellIndex) => (
                        <motion.div
                          key={cell.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (weekIndex * 7 + cellIndex) * 0.02 }}
                          whileHover={{ scale: 1.15, zIndex: 10 }}
                          className="h-10 w-full rounded-xl cursor-pointer transition-all duration-300"
                          style={getIntensityStyle(cell.intensity)}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t" style={{ borderColor: "var(--stroke)" }}>
              <span className="text-xs" style={{ color: "var(--muted)" }}>少</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-md transition-transform hover:scale-110"
                    style={getIntensityStyle(i)}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: "var(--muted)" }}>多</span>
            </div>
          </div>
        </motion.section>

        {/* Vocabulary Section */}
        <motion.section
          variants={itemVariants}
          className="neu-float p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: "var(--accent)" }} />
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  生词本
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                共 {vocabularySet.length} 个单词
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-container h-8 w-8"
            >
              <FilePenLine className="h-4 w-4" style={{ color: "var(--muted)" }} />
            </motion.button>
          </div>

          <div className="space-y-4">
            {vocabularySet.map((item, index) => (
              <motion.div
                key={item.word}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="neu-inset p-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{item.word}</p>
                  <ChevronRight 
                    className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" 
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                  {item.definition}
                </p>
                <p className="text-sm italic" style={{ color: "var(--muted)" }}>
                  "{item.context}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Recent Documents & Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <motion.section
          variants={itemVariants}
          className="neu-float p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FilePenLine className="h-5 w-5" style={{ color: "var(--accent)" }} />
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  最近文档
                </p>
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                点击任一条目即可跳转至工作台继续编辑
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/write">
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="neu-raised p-4 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm pr-4 line-clamp-1">{doc.title}</p>
                      <span className="badge-accent text-[10px] flex-shrink-0">
                        Band {doc.band}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {doc.updatedAt}
                      </span>
                      <div className="flex items-center gap-2">
                        <span 
                          className="badge-neu text-[10px]"
                          style={{ 
                            background: doc.status === "已批改" 
                              ? "var(--success-bg)" 
                              : doc.status === "待润色"
                              ? "var(--warning-bg)"
                              : "var(--background-elevated)"
                          }}
                        >
                          {doc.status}
                        </span>
                        <ArrowUpRight 
                          className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" 
                          style={{ color: "var(--accent)" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Insights Section */}
        <motion.section
          variants={itemVariants}
          className="neu-float p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              洞察 & 建议
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="serif text-2xl">
              逻辑得分持续拉升，建议把注意力放在语法一致性。
            </h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              根据 mock 数据，近三次批改的语法平均分 6.3，主要集中在主谓一致与定冠词缺失。
              建议在工作台使用浮动菜单的 Ask AI 模块生成语法检查列表。
            </p>

            {/* Progress Bars */}
            <div className="space-y-3 pt-2">
              {[
                { label: "词汇", value: 7.5 },
                { label: "语法", value: 6.3 },
                { label: "逻辑", value: 7.2 },
                { label: "连贯性", value: 7.0 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted)" }}>{item.label}</span>
                    <span style={{ color: "var(--accent)" }}>Band {item.value}</span>
                  </div>
                  <div className="progress-neu">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.value / 9) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="progress-neu-fill"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="neu-inset p-4 mt-4">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                💡 数据说明：所有指标使用 mockData.ts 提供的 JSON 对象，便于后续替换成真实 API 响应。
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
