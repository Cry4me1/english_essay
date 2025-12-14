"use client";

import { useEffect, useState, useMemo } from "react";
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
  Lightbulb,
  LoaderCircle,
  FileText,
  Trash2
} from "lucide-react";
import type { Essay, VocabularyItem, PaginatedResponse } from "@/lib/types/database";
import { deleteEssay } from "@/lib/api/essays";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";

// 热力图数据类型
interface HeatmapCell {
  id: string;
  day: number;
  week: number;
  intensity: number;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `今天 · ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffDays === 1) {
    return `昨天 · ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getMonth() + 1}月 ${date.getDate()}日`;
  }
}

// 获取文章状态显示文本
function getStatusText(essay: Essay): string {
  if (essay.ai_score !== null) return "已批改";
  if (essay.status === "draft") return "草稿";
  if (essay.status === "completed") return "已完成";
  return "未批改";
}

export default function DashboardPage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [allEssays, setAllEssays] = useState<Essay[]>([]); // 用于趋势图的所有文章
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 删除文章
  const handleDeleteEssay = async (e: React.MouseEvent, essayId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return;

    setDeletingId(essayId);
    try {
      await deleteEssay(essayId);
      setEssays(prev => prev.filter(essay => essay.id !== essayId));
    } catch (err) {
      console.error('删除文章失败:', err);
      setError('删除文章失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // 并行获取文章和生词
        const [essaysRes, allEssaysRes, vocabRes] = await Promise.all([
          fetch('/api/essays?limit=5'),
          fetch('/api/essays?limit=100'), // 获取所有文章用于趋势图
          fetch('/api/vocabulary?limit=5'),
        ]);

        if (essaysRes.ok) {
          const essaysData: PaginatedResponse<Essay> = await essaysRes.json();
          setEssays(essaysData.data || []);
        }

        if (allEssaysRes.ok) {
          const allEssaysData: PaginatedResponse<Essay> = await allEssaysRes.json();
          setAllEssays(allEssaysData.data || []);
        }

        if (vocabRes.ok) {
          const vocabData: PaginatedResponse<VocabularyItem> = await vocabRes.json();
          setVocabulary(vocabData.data || []);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalWords = essays.reduce((sum, e) => sum + (e.word_count || 0), 0);
    const scoredEssays = essays.filter(e => e.ai_score !== null);
    const avgScore = scoredEssays.length > 0
      ? (scoredEssays.reduce((sum, e) => sum + (e.ai_score || 0), 0) / scoredEssays.length).toFixed(1)
      : '-';

    return [
      { label: "平均分数", value: avgScore === '-' ? '-' : `Band ${avgScore}`, trend: `共 ${scoredEssays.length} 篇已批改` },
      { label: "累计字数", value: totalWords.toLocaleString(), trend: `共 ${essays.length} 篇文章` },
      { label: "生词收藏", value: `${vocabulary.length} 词`, trend: "继续积累" },
      { label: "已批改", value: `${scoredEssays.length} 篇`, trend: "AI 深度批改" },
    ];
  }, [essays, vocabulary]);

  // 生成热力图数据（基于真实文章创建日期）
  const heatmapData = useMemo((): HeatmapCell[] => {
    const now = new Date();
    const cells: HeatmapCell[] = [];

    // 统计每天的写作量
    const dailyWords: Record<string, number> = {};
    essays.forEach(essay => {
      const date = new Date(essay.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      dailyWords[key] = (dailyWords[key] || 0) + (essay.word_count || 0);
    });

    // 生成28天的热力图
    for (let i = 27; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const words = dailyWords[key] || 0;

      // 根据字数计算强度 (0-4)
      let intensity = 0;
      if (words > 0) intensity = 1;
      if (words > 200) intensity = 2;
      if (words > 500) intensity = 3;
      if (words > 1000) intensity = 4;

      const dayIndex = 27 - i;
      cells.push({
        id: `cell-${dayIndex}`,
        day: dayIndex % 7,
        week: Math.floor(dayIndex / 7),
        intensity,
      });
    }
    return cells;
  }, [essays]);

  // 按周分组热力图
  const groupedHeatmap = useMemo(() => {
    return Array.from({ length: 4 }, (_, weekIndex) =>
      heatmapData.filter((cell) => cell.week === weekIndex)
    );
  }, [heatmapData]);

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
              追踪你的写作进度，查看评分趋势与最近文档。
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
        {stats.map((stat, index) => (
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
                共 {vocabulary.length} 个单词
              </p>
            </div>
            <Link href="/vocabulary">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="icon-container h-8 w-8 cursor-pointer"
                title="查看全部生词"
              >
                <ArrowUpRight className="h-4 w-4" style={{ color: "var(--accent)" }} />
              </motion.div>
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
              </div>
            ) : vocabulary.length === 0 ? (
              <div className="neu-inset p-6 rounded-xl text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--muted)" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  暂无收藏的生词
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  在工作台双击单词可查词并收藏
                </p>
              </div>
            ) : (
              vocabulary.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="neu-inset p-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.word}</p>
                      {item.phonetic && (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {item.phonetic}
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  {item.definition && (
                    <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                      {item.definition}
                    </p>
                  )}
                  {item.context_sentence && (
                    <p className="text-sm italic" style={{ color: "var(--muted)" }}>
                      "{item.context_sentence}"
                    </p>
                  )}
                </motion.div>
              ))
            )}

            {/* View All Link */}
            {vocabulary.length > 0 && (
              <Link href="/vocabulary">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="neu-inset p-3 cursor-pointer text-center group"
                >
                  <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                    查看全部生词 →
                  </span>
                </motion.div>
              </Link>
            )}
          </div>
        </motion.section>
      </div>

      {/* Score Trend Chart */}
      <motion.div variants={itemVariants}>
        <ScoreTrendChart essays={allEssays} />
      </motion.div>

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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
              </div>
            ) : essays.length === 0 ? (
              <div className="neu-inset p-6 rounded-xl text-center">
                <FileText className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--muted)" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  暂无文章记录
                </p>
                <Link href="/write">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 neu-button-accent px-4 py-2 text-xs font-medium"
                  >
                    开始写作
                  </motion.button>
                </Link>
              </div>
            ) : (
              essays.map((essay, index) => {
                const statusText = getStatusText(essay);
                return (
                  <motion.div
                    key={essay.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/write?id=${essay.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="neu-raised p-4 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm pr-4 line-clamp-1">
                            {essay.title || "无标题"}
                          </p>
                          <div className="flex items-center gap-2">
                            {essay.ai_score !== null && (
                              <span className="badge-accent text-[10px] flex-shrink-0">
                                Band {essay.ai_score}
                              </span>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDeleteEssay(e, essay.id)}
                              disabled={deletingId === essay.id}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                              title="删除文章"
                            >
                              {deletingId === essay.id ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" style={{ color: "var(--error)" }} />
                              ) : (
                                <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            {formatDate(essay.updated_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="badge-neu text-[10px]"
                              style={{
                                background: statusText === "已批改"
                                  ? "var(--success-bg)"
                                  : statusText === "草稿"
                                    ? "var(--warning-bg)"
                                    : "var(--background-elevated)"
                              }}
                            >
                              {statusText}
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
                );
              })
            )}
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
            {essays.length === 0 ? (
              <>
                <h3 className="serif text-2xl">
                  开始你的写作之旅
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  还没有写作记录。前往工作台创建你的第一篇文章，AI 将为你提供深度批改和建议。
                </p>
              </>
            ) : (
              <>
                <h3 className="serif text-2xl">
                  {essays.filter(e => e.ai_score !== null).length > 0
                    ? "继续保持，你的写作水平正在提升！"
                    : "提交文章进行 AI 批改，获取详细反馈"}
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  你已创建 {essays.length} 篇文章，累计 {essays.reduce((sum, e) => sum + (e.word_count || 0), 0).toLocaleString()} 词。
                  {essays.filter(e => e.ai_score !== null).length > 0
                    ? `平均分数 Band ${(essays.filter(e => e.ai_score !== null).reduce((sum, e) => sum + (e.ai_score || 0), 0) / essays.filter(e => e.ai_score !== null).length).toFixed(1)}。`
                    : "使用批改功能获取详细的评分和改进建议。"
                  }
                </p>
              </>
            )}

            {/* 显示最近批改的分数明细 */}
            {(() => {
              const latestScored = essays.find(e => e.ai_feedback?.breakdown);
              if (!latestScored?.ai_feedback?.breakdown) return null;

              return (
                <div className="space-y-3 pt-2">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>最近批改得分明细</p>
                  {latestScored.ai_feedback.breakdown.map((item) => (
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
              );
            })()}

            <div className="neu-inset p-4 mt-4">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                💡 建议：保持每日写作习惯，使用 AI 批改功能持续提升写作水平。
              </p>
            </div>
          </div>
        </motion.section>
      </div >

      {/* Error Toast */}
      {
        error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 neu-raised p-4 rounded-xl"
            style={{ borderLeft: "3px solid var(--error)" }}
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )
      }
    </motion.div >
  );
}
