"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  LoaderCircle,
  PenSquare,
  Sparkles,
  Wand2,
  X,
  Clock,
  FileText,
  Zap,
  Target,
  Languages,
  BookOpen,
} from "lucide-react";
import {
  assistantPresets,
  correctionPayload,
  generationChunks,
} from "@/lib/mockData";
import { useWorkbenchStore } from "@/lib/store/workbenchStore";
import { cn } from "@/lib/utils";

type Annotation = (typeof correctionPayload.annotations)[number];

const typeStyles = {
  grammar: { 
    bg: "var(--error-bg)", 
    color: "#ef4444",
    label: "语法"
  },
  vocabulary: { 
    bg: "var(--warning-bg)", 
    color: "#f59e0b",
    label: "词汇"
  },
  logic: { 
    bg: "rgba(91, 95, 199, 0.12)", 
    color: "var(--accent)",
    label: "逻辑"
  },
};

export default function WritePage() {
  const {
    title,
    setTitle,
    content,
    setContent,
    aiPanelMode,
    setAiPanelMode,
    isGenerating,
    setIsGenerating,
    selectedAnnotationId,
    setSelectedAnnotationId,
  } = useWorkbenchStore();

  const [formValues, setFormValues] = useState({
    topic: title,
    tone: "Academic",
    words: 280,
  });
  const [generatedChunks, setGeneratedChunks] = useState<string[]>([]);
  const [resolvedAnnotations, setResolvedAnnotations] = useState<string[]>([]);
  const [selectionActive, setSelectionActive] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const annotationRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedAnnotationId && correctionPayload.annotations.length) {
      setSelectedAnnotationId(correctionPayload.annotations[0].id);
    }
  }, [selectedAnnotationId, setSelectedAnnotationId]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const normalizedContent = typeof content === "string" ? content : "";

  const wordCount = useMemo(() => {
    return normalizedContent.trim().length
      ? normalizedContent.split(/\s+/).filter(Boolean).length
      : 0;
  }, [normalizedContent]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const selectedAnnotation = correctionPayload.annotations.find(
    (annotation) => annotation.id === selectedAnnotationId
  );

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;
    setGeneratedChunks([]);
    setIsGenerating(true);
    let index = 0;
    streamTimerRef.current = setInterval(() => {
      setGeneratedChunks((prev) => [...prev, generationChunks[index]]);
      index += 1;
      if (index === generationChunks.length) {
        setIsGenerating(false);
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
        }
      }
    }, 900);
  };

  const handleInsertToEditor = () => {
    if (!generatedChunks.length) return;
    const newParagraph = generatedChunks.join(" ");
    setContent((prev) => `${prev.trim()}\n\n${newParagraph}`.trim());
    setGeneratedChunks([]);
  };

  const handleAcceptAnnotation = (annotation: Annotation) => {
    if (resolvedAnnotations.includes(annotation.id)) return;
    setContent((prev) => prev.replace(annotation.originalText, annotation.suggestion));
    setResolvedAnnotations((prev) => [...prev, annotation.id]);
  };

  const handleRejectAnnotation = (annotation: Annotation) => {
    if (resolvedAnnotations.includes(annotation.id)) return;
    setResolvedAnnotations((prev) => [...prev, annotation.id]);
  };

  const handleSelection = () => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    setSelectionActive(selectionEnd - selectionStart > 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-float p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs transition-colors hover:text-accent"
              style={{ color: "var(--muted)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
            <h1 className="serif text-3xl">沉浸式工作台</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              左侧编辑器 + 右侧 AI 面板，支持生成与批改模式切换
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFocusMode(!focusMode)}
              className={cn(
                "neu-button px-4 py-2.5 text-sm font-medium transition-all",
                focusMode && "neu-button-accent"
              )}
            >
              <Zap className="h-4 w-4 inline-block mr-2" />
              专注模式
            </motion.button>
            
            <div className="neu-inset flex p-1 rounded-xl">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAiPanelMode("generate")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  aiPanelMode === "generate"
                    ? "bg-gradient-to-r from-accent-light to-accent text-white shadow-md"
                    : "text-muted hover:text-foreground"
                )}
                style={aiPanelMode === "generate" ? { background: "linear-gradient(145deg, var(--accent-light), var(--accent))" } : {}}
              >
                <Sparkles className="h-4 w-4" />
                生成
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAiPanelMode("correct")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  aiPanelMode === "correct"
                    ? "bg-gradient-to-r from-accent-light to-accent text-white shadow-md"
                    : "text-muted hover:text-foreground"
                )}
                style={aiPanelMode === "correct" ? { background: "linear-gradient(145deg, var(--accent-light), var(--accent))" } : {}}
              >
                <PenSquare className="h-4 w-4" />
                批改
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[1.2fr_0.8fr]"
      )}>
        {/* Editor Panel */}
        <motion.div
          layout
          className="neu-float p-6 space-y-5"
        >
          {/* Floating Menu */}
          <AnimatePresence>
            {selectionActive && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-8 top-20 z-20"
              >
                <div className="neu-raised flex items-center gap-1 p-2 rounded-xl">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent/10 transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Ask AI
                  </motion.button>
                  <div className="w-px h-4 bg-stroke" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-background-elevated transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    <Languages className="h-3.5 w-3.5" />
                    翻译
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-background-elevated transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    同义词
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              <FileText className="h-3.5 w-3.5" />
              标题
            </label>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormValues((prev) => ({ ...prev, topic: event.target.value }));
              }}
              className="neu-input w-full px-5 py-4 text-lg font-medium"
              placeholder="输入文章标题..."
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                <PenSquare className="h-3.5 w-3.5" />
                正文
              </label>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {wordCount} 词
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  约 {readingTime} 分钟
                </span>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={normalizedContent}
              onChange={(event) => setContent(event.target.value)}
              onSelect={handleSelection}
              className="neu-input w-full min-h-[400px] p-5 text-sm leading-8 resize-none serif"
              placeholder="开始你的写作..."
            />
          </div>

          {/* Annotation Preview */}
          <AnimatePresence>
            {selectedAnnotation && aiPanelMode === "correct" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div 
                  className="neu-inset p-4 rounded-2xl"
                  style={{ borderLeft: `3px solid ${typeStyles[selectedAnnotation.type]?.color || "var(--accent)"}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="badge-neu text-[10px]"
                      style={{ 
                        background: typeStyles[selectedAnnotation.type]?.bg,
                        color: typeStyles[selectedAnnotation.type]?.color
                      }}
                    >
                      {typeStyles[selectedAnnotation.type]?.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>当前高亮</span>
                  </div>
                  <p className="text-sm mb-2">
                    <span style={{ color: "var(--muted)" }}>原句：</span>
                    <span className="line-through opacity-60">{selectedAnnotation.originalText}</span>
                  </p>
                  <p className="text-sm">
                    <span style={{ color: "var(--muted)" }}>建议：</span>
                    <span style={{ color: typeStyles[selectedAnnotation.type]?.color }}>{selectedAnnotation.suggestion}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Annotation Tags */}
          {aiPanelMode === "correct" && (
            <div className="flex flex-wrap gap-2 pt-2">
              {correctionPayload.annotations.map((annotation) => {
                const isResolved = resolvedAnnotations.includes(annotation.id);
                const isSelected = selectedAnnotationId === annotation.id;
                return (
                  <motion.button
                    key={annotation.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAnnotationId(annotation.id);
                      requestAnimationFrame(() => {
                        annotationRefs.current[annotation.id]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                      isResolved && "opacity-50",
                      isSelected
                        ? "text-white shadow-md"
                        : "neu-button"
                    )}
                    style={isSelected ? { 
                      background: `linear-gradient(145deg, ${typeStyles[annotation.type]?.color}, ${typeStyles[annotation.type]?.color}dd)`,
                      boxShadow: `0 4px 15px ${typeStyles[annotation.type]?.bg}`
                    } : {}}
                  >
                    {isResolved && <Check className="h-3 w-3 inline-block mr-1" />}
                    {typeStyles[annotation.type]?.label}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* AI Panel */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="neu-float p-6 space-y-5 h-fit lg:sticky lg:top-24"
            >
              <AnimatePresence mode="wait">
                {aiPanelMode === "generate" ? (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        Generator
                      </span>
                    </div>

                    <form className="space-y-4" onSubmit={handleGenerate}>
                      <div className="space-y-2">
                        <label className="text-xs" style={{ color: "var(--muted)" }}>Topic</label>
                        <input
                          value={formValues.topic}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, topic: e.target.value }))}
                          className="neu-input w-full px-4 py-3 text-sm"
                          placeholder="输入主题..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs" style={{ color: "var(--muted)" }}>Tone</label>
                          <select
                            value={formValues.tone}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, tone: e.target.value }))}
                            className="neu-input w-full px-4 py-3 text-sm"
                          >
                            <option>Academic</option>
                            <option>Conversational</option>
                            <option>Debate</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs" style={{ color: "var(--muted)" }}>Words</label>
                          <input
                            type="number"
                            min={150}
                            max={400}
                            value={formValues.words}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, words: Number(e.target.value) }))}
                            className="neu-input w-full px-4 py-3 text-sm"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isGenerating}
                        className="neu-button-accent w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            触发生成
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Output Stream */}
                    <div className="neu-inset p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          输出流
                        </span>
                        {generatedChunks.length > 0 && (
                          <span className="badge-accent text-[10px]">
                            {generatedChunks.length}/{generationChunks.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {generatedChunks.length === 0 ? (
                          <p className="text-sm" style={{ color: "var(--muted)" }}>
                            点击"触发生成"后将以分段形式展示模拟流式输出。
                          </p>
                        ) : (
                          generatedChunks.map((chunk, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="neu-raised p-3 rounded-xl"
                            >
                              <p className="text-sm serif leading-relaxed">
                                {chunk}
                                {index === generatedChunks.length - 1 && isGenerating && (
                                  <span className="typing-cursor" />
                                )}
                              </p>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {generatedChunks.length > 0 && !isGenerating && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleInsertToEditor}
                          className="mt-4 neu-button w-full py-2.5 text-xs font-medium flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          插入编辑器
                        </motion.button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="space-y-2">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>题目预设</span>
                      <div className="flex flex-wrap gap-2">
                        {assistantPresets.map((preset) => (
                          <motion.button
                            key={preset.title}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setFormValues({
                              topic: preset.excerpt,
                              tone: preset.tone,
                              words: preset.words,
                            })}
                            className="neu-button px-3 py-1.5 text-xs"
                          >
                            {preset.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="correct"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" style={{ color: "var(--accent)" }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        Correction
                      </span>
                    </div>

                    {/* Score Dashboard */}
                    <div className="neu-inset p-5 rounded-2xl text-center">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>综合得分</p>
                      <p className="serif text-5xl font-medium" style={{ color: "var(--accent)" }}>
                        {correctionPayload.score}
                      </p>
                      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                        {correctionPayload.summary}
                      </p>
                      
                      {/* Score Breakdown */}
                      <div className="mt-5 space-y-3">
                        {correctionPayload.breakdown.map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span style={{ color: "var(--muted)" }}>{item.label}</span>
                              <span style={{ color: "var(--accent)" }}>Band {item.value}</span>
                            </div>
                            <div className="progress-neu">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / 9) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="progress-neu-fill"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Annotations List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {correctionPayload.annotations.map((annotation, index) => {
                        const isResolved = resolvedAnnotations.includes(annotation.id);
                        const isSelected = selectedAnnotationId === annotation.id;
                        const style = typeStyles[annotation.type];
                        
                        return (
                          <motion.div
                            key={annotation.id}
                            ref={(el) => { annotationRefs.current[annotation.id] = el; }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedAnnotationId(annotation.id)}
                            className={cn(
                              "p-4 rounded-2xl cursor-pointer transition-all duration-300",
                              isSelected ? "neu-raised" : "neu-inset",
                              isResolved && "opacity-60"
                            )}
                            style={isSelected ? { borderLeft: `3px solid ${style?.color}` } : {}}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span 
                                className="badge-neu text-[10px]"
                                style={{ background: style?.bg, color: style?.color }}
                              >
                                {style?.label}
                              </span>
                              {isResolved && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}>
                                  <Check className="h-3 w-3" />
                                  已处理
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm line-clamp-2 mb-1">{annotation.originalText}</p>
                            <p className="text-sm mb-1" style={{ color: style?.color }}>
                              {annotation.suggestion}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                              {annotation.reason}
                            </p>

                            {!isResolved && (
                              <div className="flex gap-2 mt-3">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptAnnotation(annotation);
                                  }}
                                  className="flex-1 py-2 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1"
                                  style={{ background: "linear-gradient(145deg, var(--success), #16a34a)" }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  接受
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectAnnotation(annotation);
                                  }}
                                  className="flex-1 neu-button py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  保留
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Mock Data Notice */}
                    <div className="neu-inset p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4" style={{ color: "var(--warning)" }} />
                        <span className="text-xs font-medium">Mock 数据</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        当前批改数据取自 correctionPayload JSON；接入 Gemini 后只需替换数据源即可。
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
