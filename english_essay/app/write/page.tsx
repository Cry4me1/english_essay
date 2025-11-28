"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  assistantPresets,
  correctionPayload,
  generationChunks,
} from "@/lib/mockData";
import { useWorkbenchStore } from "@/lib/store/workbenchStore";
import { cn } from "@/lib/utils";

type Annotation = (typeof correctionPayload.annotations)[number];

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

  const statusBadge = (type: Annotation["type"]) => {
    const textMap = {
      grammar: "语法",
      vocabulary: "词汇",
      logic: "逻辑",
    } as const;
    return textMap[type] ?? type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white/90 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-black/60 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            返回落地页
          </Link>
          <h1 className="serif text-3xl text-black">沉浸式工作台</h1>
          <p className="text-sm text-black/70">
            左侧编辑器 + 右侧 AI 面板，当前所有数据均来自 mock JSON，便于后续接入 API。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAiPanelMode("generate")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
              aiPanelMode === "generate"
                ? "border-black text-black"
                : "border-black/30 text-black/50"
            )}
          >
            <Sparkles className="h-4 w-4" />
            生成模式
          </button>
          <button
            onClick={() => setAiPanelMode("correct")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
              aiPanelMode === "correct"
                ? "border-black text-black"
                : "border-black/30 text-black/50"
            )}
          >
            <PenSquare className="h-4 w-4" />
            批改模式
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative space-y-4 rounded-3xl border border-black/10 bg-white p-6">
          {selectionActive && (
            <div className="absolute right-8 top-6 z-10 flex items-center gap-2 rounded-full border border-black/20 bg-white px-4 py-1 text-xs shadow-sm">
              <button className="inline-flex items-center gap-1 text-black/70">
                <Wand2 className="h-3.5 w-3.5" />
                Ask AI
              </button>
              <button className="text-black/50">Translate</button>
              <button className="text-black/50">Synonyms</button>
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm">
            标题
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormValues((prev) => ({ ...prev, topic: event.target.value }));
              }}
              className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-base outline-none focus:border-black"
            />
          </label>

          <div>
            <div className="flex items-center justify-between text-xs text-black/50">
              <span>正文</span>
              <span>
                {wordCount} 词 · 预计 {readingTime} min
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={normalizedContent}
              onChange={(event) => setContent(event.target.value)}
              onSelect={handleSelection}
              className="mt-2 min-h-[360px] w-full rounded-3xl border border-black/15 bg-[#f7f7f2] p-5 text-sm leading-7 outline-none focus:border-black"
            />
          </div>

          {selectedAnnotation && (
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f2] p-4 text-sm text-black/70">
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                当前高亮
              </p>
              <p className="mt-2 text-black">原句：{selectedAnnotation.originalText}</p>
              <p className="mt-1 text-black">建议：{selectedAnnotation.suggestion}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {correctionPayload.annotations.map((annotation) => (
              <button
                key={annotation.id}
                onClick={() => {
                  setSelectedAnnotationId(annotation.id);
                  setAiPanelMode("correct");
                  requestAnimationFrame(() => {
                    annotationRefs.current[annotation.id]?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  });
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  selectedAnnotationId === annotation.id
                    ? "border-black bg-black text-white"
                    : "border-black/30 text-black/60"
                )}
              >
                {statusBadge(annotation.type)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-6">
          {aiPanelMode === "generate" ? (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Generator
              </p>
              <form className="space-y-4" onSubmit={handleGenerate}>
                <label className="flex flex-col gap-1 text-sm text-black/70">
                  Topic
                  <input
                    value={formValues.topic}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, topic: event.target.value }))
                    }
                    className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-black/70">
                  Tone
                  <select
                    value={formValues.tone}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, tone: event.target.value }))
                    }
                    className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    <option>Academic</option>
                    <option>Conversational</option>
                    <option>Debate</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-black/70">
                  Word Count
                  <input
                    type="number"
                    min={150}
                    max={400}
                    value={formValues.words}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        words: Number(event.target.value),
                      }))
                    }
                    className="rounded-2xl border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white"
                >
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      正在模拟生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      触发生成
                    </>
                  )}
                </button>
              </form>
              <div className="rounded-2xl border border-black/10 bg-[#f7f7f2] p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                  输出流
                </p>
                <div className="mt-3 space-y-3">
                  {generatedChunks.length === 0 && (
                    <p className="text-black/60">
                      点击“触发生成”后将以 3 段落形式展示模拟流式输出。
                    </p>
                  )}
                  {generatedChunks.map((chunk, index) => (
                    <p key={index} className="rounded-xl bg-white p-3 text-black/80">
                      {chunk}
                    </p>
                  ))}
                </div>
                <button
                  onClick={handleInsertToEditor}
                  className="mt-4 inline-flex items-center gap-2 text-xs text-black/70"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Insert to editor
                </button>
              </div>
              <div className="space-y-2 text-xs text-black/50">
                <p>题目预设</p>
                <div className="flex flex-wrap gap-2">
                  {assistantPresets.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() =>
                        setFormValues({
                          topic: preset.excerpt,
                          tone: preset.tone,
                          words: preset.words,
                        })
                      }
                      className="rounded-full border border-black/20 px-3 py-1"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                Correction
              </p>
              <div className="rounded-2xl border border-black/10 bg-[#f7f7f2] p-4">
                <p className="text-sm text-black/60">综合得分</p>
                <p className="serif text-4xl text-black">{correctionPayload.score}</p>
                <p className="text-xs text-black/60">{correctionPayload.summary}</p>
                <div className="mt-4 grid gap-3">
                  {correctionPayload.breakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs text-black/60">
                        <span>{item.label}</span>
                        <span>Band {item.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{ width: `${(item.value / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {correctionPayload.annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    ref={(el) => {
                      annotationRefs.current[annotation.id] = el;
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-sm",
                      selectedAnnotationId === annotation.id
                        ? "border-black bg-white"
                        : "border-black/15 bg-[#f7f7f2]"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-black/60">
                      <span>{statusBadge(annotation.type)}</span>
                      {resolvedAnnotations.includes(annotation.id) && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          已处理
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-black">{annotation.originalText}</p>
                    <p className="mt-1 text-black/70">{annotation.suggestion}</p>
                    <p className="mt-1 text-xs text-black/50">{annotation.reason}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAnnotationId(annotation.id);
                          handleAcceptAnnotation(annotation);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                        disabled={resolvedAnnotations.includes(annotation.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        接受
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAnnotationId(annotation.id);
                          handleRejectAnnotation(annotation);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-black/20 px-3 py-1.5 text-xs text-black/70 disabled:opacity-40"
                        disabled={resolvedAnnotations.includes(annotation.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        保留
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-black/20 bg-[#f7f7f2] p-4 text-xs text-black/60">
                <div className="flex items-center gap-2 text-black/70">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Mock 数据
                </div>
                <p className="mt-2">
                  当前批改数据取自 `correctionPayload` JSON；接入 Gemini
                  后只需替换数据源即可。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

