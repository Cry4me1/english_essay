"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    BookOpen,
    Search,
    Trash2,
    LoaderCircle,
    Volume2,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import type { VocabularyItem, PaginatedResponse } from "@/lib/types/database";
import { removeVocabulary } from "@/lib/api/vocabulary";

const ITEMS_PER_PAGE = 10;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
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
        return "今天";
    } else if (diffDays === 1) {
        return "昨天";
    } else if (diffDays < 7) {
        return `${diffDays} 天前`;
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

export default function VocabularyPage() {
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(0); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch vocabulary
    const fetchVocabulary = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set("limit", ITEMS_PER_PAGE.toString());
            params.set("offset", (currentPage * ITEMS_PER_PAGE).toString());
            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            }

            const res = await fetch(`/api/vocabulary?${params}`);
            if (res.ok) {
                const data: PaginatedResponse<VocabularyItem> = await res.json();
                setVocabulary(data.data || []);
                setTotal(data.total || 0);
            } else {
                throw new Error("Failed to fetch vocabulary");
            }
        } catch (err) {
            console.error("获取生词列表失败:", err);
            setError("获取生词列表失败，请刷新重试");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchVocabulary();
    }, [fetchVocabulary]);

    // Delete vocabulary item
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (!confirm("确定要删除这个生词吗？")) return;

        setDeletingId(id);
        try {
            await removeVocabulary(id);
            setVocabulary(prev => prev.filter(item => item.id !== id));
            setTotal(prev => prev - 1);
        } catch (err) {
            console.error("删除生词失败:", err);
            setError("删除失败，请重试");
        } finally {
            setDeletingId(null);
        }
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-grid p-4 md:p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.section variants={itemVariants} className="neu-float p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/dashboard">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="icon-container h-10 w-10 cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5" style={{ color: "var(--accent)" }} />
                            </motion.div>
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <div className="badge-accent text-[10px]">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                                    Vocabulary
                                </div>
                            </div>
                            <h1 className="serif text-2xl md:text-3xl">我的生词本</h1>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>共 {total} 个生词</span>
                        </div>
                    </div>
                </motion.section>

                {/* Search Bar */}
                <motion.section variants={itemVariants} className="neu-float p-4">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                            style={{ color: "var(--muted)" }}
                        />
                        <input
                            type="text"
                            placeholder="搜索单词..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="neu-input w-full pl-12 pr-10 py-3 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
                            </button>
                        )}
                    </div>
                </motion.section>

                {/* Vocabulary List */}
                <motion.section variants={itemVariants} className="space-y-4">
                    {loading ? (
                        <div className="neu-float p-12 text-center">
                            <LoaderCircle className="h-8 w-8 animate-spin mx-auto" style={{ color: "var(--accent)" }} />
                            <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
                                加载中...
                            </p>
                        </div>
                    ) : vocabulary.length === 0 ? (
                        <div className="neu-float p-12 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--muted)" }} />
                            <p className="text-lg font-medium mb-2">
                                {debouncedSearch ? "未找到匹配的生词" : "还没有收藏的生词"}
                            </p>
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                {debouncedSearch
                                    ? "试试其他关键词"
                                    : "在工作台双击单词可查词并收藏"}
                            </p>
                            {!debouncedSearch && (
                                <Link href="/write">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="mt-4 neu-button-accent px-5 py-2.5 text-sm font-medium"
                                    >
                                        前往工作台
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {vocabulary.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    className="neu-float p-5 cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Word & Phonetic */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-medium">{item.word}</h3>
                                                {item.phonetic && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm" style={{ color: "var(--muted)" }}>
                                                            {item.phonetic}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const utterance = new SpeechSynthesisUtterance(item.word);
                                                                utterance.lang = "en-US";
                                                                speechSynthesis.speak(utterance);
                                                            }}
                                                            className="p-1 hover:opacity-70 transition-opacity"
                                                        >
                                                            <Volume2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Part of Speech */}
                                            {item.part_of_speech && item.part_of_speech.length > 0 && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    {item.part_of_speech.map((pos, i) => (
                                                        <span key={i} className="badge-neu text-xs">
                                                            {pos}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Definition */}
                                            {item.definition && (
                                                <p className="text-sm mb-2" style={{ color: "var(--foreground)" }}>
                                                    {item.definition}
                                                </p>
                                            )}

                                            {/* Expanded Details */}
                                            {expandedId === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 pt-4 border-t space-y-3"
                                                    style={{ borderColor: "var(--stroke)" }}
                                                >
                                                    {/* Context Sentence */}
                                                    {item.context_sentence && (
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                                                                例句
                                                            </p>
                                                            <p className="text-sm italic" style={{ color: "var(--foreground)" }}>
                                                                "{item.context_sentence}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Synonyms */}
                                                    {item.synonyms && item.synonyms.length > 0 && (
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                                                                同义词
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.synonyms.map((syn, i) => (
                                                                    <span key={i} className="badge-neu text-xs">
                                                                        {syn}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                                                {formatDate(item.created_at)}
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => handleDelete(e, item.id)}
                                                disabled={deletingId === item.id}
                                                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                                                title="删除生词"
                                            >
                                                {deletingId === item.id ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" style={{ color: "var(--error)" }} />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Expand Hint */}
                                    <p
                                        className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        {expandedId === item.id ? "点击收起" : "点击展开详情"}
                                    </p>
                                </motion.div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="neu-float p-4 flex items-center justify-between"
                                >
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="neu-button px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        上一页
                                    </button>
                                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                                        第 {currentPage + 1} / {totalPages} 页
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="neu-button px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        下一页
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </>
                    )}
                </motion.section>

                {/* Error Toast */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-4 right-4 neu-raised p-4 rounded-xl"
                        style={{ borderLeft: "3px solid var(--error)" }}
                    >
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
