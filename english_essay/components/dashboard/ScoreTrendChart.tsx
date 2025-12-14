"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { TrendingUp, Award, Target } from "lucide-react";
import type { Essay } from "@/lib/types/database";

interface ScoreTrendChartProps {
    essays: Essay[];
}

// 格式化日期为短格式
function formatShortDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 自定义 Tooltip 组件
interface TooltipPayload {
    value: number;
    dataKey: string;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div
            className="neu-float p-4 rounded-xl"
            style={{
                background: "var(--background)",
                border: "1px solid var(--stroke)",
            }}
        >
            <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                {label}
            </p>
            {payload.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.color }}
                    />
                    <span style={{ color: "var(--muted)" }}>
                        {item.dataKey === "score" ? "总分" : item.dataKey}:
                    </span>
                    <span className="font-medium" style={{ color: "var(--accent)" }}>
                        Band {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function ScoreTrendChart({ essays }: ScoreTrendChartProps) {
    // 筛选有分数的文章，并按创建时间排序
    const chartData = useMemo(() => {
        const scoredEssays = essays
            .filter((e) => e.ai_score !== null)
            .sort(
                (a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

        return scoredEssays.map((essay) => ({
            date: formatShortDate(essay.created_at),
            score: essay.ai_score || 0,
            title: essay.title,
            vocabulary: essay.ai_feedback?.breakdown?.find(
                (b) => b.label === "词汇多样性" || b.label.includes("Vocabulary")
            )?.value,
            grammar: essay.ai_feedback?.breakdown?.find(
                (b) => b.label === "语法准确性" || b.label.includes("Grammar")
            )?.value,
            logic: essay.ai_feedback?.breakdown?.find(
                (b) => b.label === "逻辑连贯性" || b.label.includes("Coherence")
            )?.value,
        }));
    }, [essays]);

    // 计算统计数据
    const stats = useMemo(() => {
        if (chartData.length === 0) {
            return { firstScore: 0, latestScore: 0, highestScore: 0, improvement: 0 };
        }

        const scores = chartData.map((d) => d.score);
        const firstScore = scores[0];
        const latestScore = scores[scores.length - 1];
        const highestScore = Math.max(...scores);
        const improvement = latestScore - firstScore;

        return { firstScore, latestScore, highestScore, improvement };
    }, [chartData]);

    // 空状态
    if (chartData.length === 0) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neu-float p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5" style={{ color: "var(--accent)" }} />
                    <p
                        className="text-xs uppercase tracking-[0.2em]"
                        style={{ color: "var(--muted)" }}
                    >
                        分数趋势
                    </p>
                </div>

                <div className="neu-inset p-8 rounded-xl text-center">
                    <TrendingUp
                        className="h-10 w-10 mx-auto mb-3"
                        style={{ color: "var(--muted)" }}
                    />
                    <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
                        暂无批改数据
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        提交文章进行 AI 批改后，这里将显示你的分数变化趋势
                    </p>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-float p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp
                            className="h-5 w-5"
                            style={{ color: "var(--accent)" }}
                        />
                        <p
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: "var(--muted)" }}
                        >
                            分数趋势
                        </p>
                    </div>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        追踪你的写作进步，共 {chartData.length} 篇已批改
                    </p>
                </div>

                {/* 进步指示器 */}
                {stats.improvement !== 0 && (
                    <div
                        className="badge-accent text-xs flex items-center gap-1"
                        style={{
                            background:
                                stats.improvement > 0
                                    ? "var(--success-bg)"
                                    : "var(--error-bg)",
                            color: stats.improvement > 0 ? "var(--success)" : "var(--error)",
                        }}
                    >
                        {stats.improvement > 0 ? "↑" : "↓"}{" "}
                        {Math.abs(stats.improvement).toFixed(1)}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div
                    whileHover={{ y: -2 }}
                    className="neu-inset p-3 rounded-xl text-center"
                >
                    <Target className="h-4 w-4 mx-auto mb-1" style={{ color: "var(--muted)" }} />
                    <p className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>
                        首次分数
                    </p>
                    <p className="serif text-lg font-medium" style={{ color: "var(--foreground)" }}>
                        {stats.firstScore.toFixed(1)}
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="neu-inset p-3 rounded-xl text-center"
                >
                    <TrendingUp className="h-4 w-4 mx-auto mb-1" style={{ color: "var(--accent)" }} />
                    <p className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>
                        最新分数
                    </p>
                    <p className="serif text-lg font-medium" style={{ color: "var(--accent)" }}>
                        {stats.latestScore.toFixed(1)}
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="neu-inset p-3 rounded-xl text-center"
                >
                    <Award className="h-4 w-4 mx-auto mb-1" style={{ color: "var(--warning)" }} />
                    <p className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>
                        最高分
                    </p>
                    <p className="serif text-lg font-medium" style={{ color: "var(--warning)" }}>
                        {stats.highestScore.toFixed(1)}
                    </p>
                </motion.div>
            </div>

            {/* Chart */}
            <div className="neu-inset p-4 rounded-xl">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--stroke)"
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--stroke)" }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 9]}
                            ticks={[0, 3, 5, 7, 9]}
                            tick={{ fontSize: 11, fill: "var(--muted)" }}
                            axisLine={{ stroke: "var(--stroke)" }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: "var(--muted)" }}
                            formatter={(value) =>
                                value === "score" ? "总分" : value
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            name="score"
                            stroke="var(--accent)"
                            strokeWidth={2.5}
                            dot={{
                                fill: "var(--accent)",
                                strokeWidth: 2,
                                stroke: "var(--background)",
                                r: 4,
                            }}
                            activeDot={{
                                fill: "var(--accent)",
                                strokeWidth: 3,
                                stroke: "var(--background)",
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.section>
    );
}
