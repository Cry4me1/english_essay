"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    FileText,
    FileType,
    Printer,
    ChevronDown,
    LoaderCircle,
    Check,
} from "lucide-react";
import { exportToPDF, exportToWord, printPreview, ExportOptions } from "@/lib/utils/export";

interface ExportMenuProps {
    title: string;
    content: string;
    correctionData?: {
        score: number;
        summary: string;
        breakdown: { label: string; value: number }[];
        annotations: {
            id: string;
            type: 'grammar' | 'vocabulary' | 'logic';
            originalText: string;
            suggestion: string;
            reason: string;
        }[];
    } | null;
    disabled?: boolean;
}

type ExportType = 'pdf' | 'word' | 'print';

export function ExportMenu({ title, content, correctionData, disabled }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<ExportType | null>(null);
    const [success, setSuccess] = useState<ExportType | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭菜单
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExport = async (type: ExportType) => {
        if (exporting || !content.trim()) return;

        setExporting(type);
        setSuccess(null);

        const options: ExportOptions = {
            title,
            content,
            correctionData,
            includeScore: true,
            includeAnnotations: true,
        };

        try {
            switch (type) {
                case 'pdf':
                    await exportToPDF(options);
                    break;
                case 'word':
                    await exportToWord(options);
                    break;
                case 'print':
                    printPreview(options);
                    break;
            }
            setSuccess(type);
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请重试');
        } finally {
            setExporting(null);
            setIsOpen(false);
        }
    };

    const menuItems = [
        {
            type: 'pdf' as ExportType,
            icon: FileText,
            label: '导出 PDF',
            description: '包含评分和批注',
            color: '#ef4444',
        },
        {
            type: 'word' as ExportType,
            icon: FileType,
            label: '导出 Word',
            description: '.docx 格式',
            color: '#2563eb',
        },
        {
            type: 'print' as ExportType,
            icon: Printer,
            label: '打印预览',
            description: '打印友好格式',
            color: '#6b6b7b',
        },
    ];

    const isDisabled = disabled || !content.trim();

    return (
        <div className="relative" ref={menuRef}>
            {/* 触发按钮 */}
            <motion.button
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`
          neu-button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
          transition-all duration-200
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
                title={isDisabled ? '请先输入内容' : '导出文章'}
            >
                {exporting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" style={{ color: 'var(--accent)' }} />
                ) : success ? (
                    <Check className="h-4 w-4" style={{ color: 'var(--success)' }} />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                <span>导出</span>
                <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--muted)' }}
                />
            </motion.button>

            {/* 下拉菜单 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-50 min-w-[200px]"
                    >
                        <div className="neu-float p-2 rounded-2xl">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isExporting = exporting === item.type;
                                const isSuccess = success === item.type;

                                return (
                                    <motion.button
                                        key={item.type}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() => handleExport(item.type)}
                                        disabled={isExporting}
                                        className={`
                      w-full flex items-center gap-3 p-3 rounded-xl
                      transition-all duration-200 text-left
                      ${isExporting ? 'opacity-70' : 'hover:bg-white/50'}
                    `}
                                    >
                                        <div
                                            className="icon-container h-9 w-9 flex-shrink-0"
                                            style={{
                                                color: isSuccess ? 'var(--success)' : item.color,
                                                background: isSuccess ? 'var(--success-bg)' : undefined,
                                            }}
                                        >
                                            {isExporting ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : isSuccess ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Icon className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
