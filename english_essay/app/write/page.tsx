"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
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
  RefreshCw,
  Volume2,
  Lightbulb,
  Star,
  StarOff,
  Copy,
  ChevronRight,
  Edit3,
  MessageSquare,
  Save,
} from "lucide-react";
import { useWorkbenchStore, VocabularyItem } from "@/lib/store/workbenchStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { addVocabulary } from "@/lib/api/vocabulary";
import { createEssay, updateEssay, getEssay } from "@/lib/api/essays";
import { useSearchParams } from "next/navigation";

// 题目预设（静态配置数据）
const assistantPresets = [
  {
    title: "Argument · 城市规划",
    tone: "Academic",
    words: 280,
    excerpt: "Discuss how public art funding impacts community identity.",
  },
  {
    title: "General Training · 申请信",
    tone: "Polite",
    words: 220,
    excerpt: "Request flexible working hours after relocating.",
  },
  {
    title: "TOEFL Integrated",
    tone: "Neutral",
    words: 320,
    excerpt: "Summarise lecture vs reading on eco-tourism limits.",
  },
];
import { cn } from "@/lib/utils";

// Types for correction API response
type AnnotationType = "grammar" | "vocabulary" | "logic";

interface Annotation {
  id: string;
  type: AnnotationType;
  originalText: string;
  suggestion: string;
  reason: string;
}

interface CorrectionBreakdown {
  label: string;
  value: number;
}

interface CorrectionPayload {
  score: number;
  summary: string;
  breakdown: CorrectionBreakdown[];
  annotations: Annotation[];
}

// Dictionary API response types
interface WordDefinition {
  pos: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
}

interface WordLookupResult {
  word: string;
  phonetic: string;
  partOfSpeech: string[];
  definitions: WordDefinition[];
  synonyms: string[];
  antonyms: string[];
}

interface TranslationResult {
  originalText: string;
  translation: string;
  explanation?: string;
}

interface SynonymItem {
  word: string;
  similarity: "exact" | "close" | "related";
  usage: string;
  example: string;
}

interface SynonymsResult {
  word: string;
  synonyms: SynonymItem[];
}

// Popover position type
interface PopoverPosition {
  x: number;
  y: number;
}

const typeStyles: Record<AnnotationType, { bg: string; color: string; label: string }> = {
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

const similarityColors = {
  exact: { bg: "var(--success-bg)", color: "var(--success)", label: "完全相同" },
  close: { bg: "var(--warning-bg)", color: "var(--warning)", label: "非常相似" },
  related: { bg: "rgba(91, 95, 199, 0.12)", color: "var(--accent)", label: "相关词汇" },
};

// Diff algorithm to find text matches in content
interface TextMatch {
  annotationId: string;
  start: number;
  end: number;
  type: AnnotationType;
}

function findTextMatches(content: string, annotations: Annotation[]): TextMatch[] {
  const matches: TextMatch[] = [];

  for (const annotation of annotations) {
    const searchText = annotation.originalText;
    if (!searchText) continue;

    // Use indexOf for exact match first
    let index = content.indexOf(searchText);

    if (index !== -1) {
      matches.push({
        annotationId: annotation.id,
        start: index,
        end: index + searchText.length,
        type: annotation.type,
      });
    } else {
      // Fuzzy match: normalize whitespace and try again
      const normalizedSearch = searchText.replace(/\s+/g, ' ').trim();
      const normalizedContent = content.replace(/\s+/g, ' ');

      // Build a position map from normalized to original
      let originalPos = 0;
      let normalizedPos = 0;
      const posMap: number[] = [];

      for (let i = 0; i < content.length; i++) {
        if (content[i].match(/\s/)) {
          // Skip consecutive whitespace in original
          if (i === 0 || !content[i - 1].match(/\s/)) {
            posMap[normalizedPos] = i;
            normalizedPos++;
          }
        } else {
          posMap[normalizedPos] = i;
          normalizedPos++;
        }
      }
      posMap[normalizedPos] = content.length;

      const normalizedIndex = normalizedContent.indexOf(normalizedSearch);
      if (normalizedIndex !== -1) {
        const startPos = posMap[normalizedIndex] ?? normalizedIndex;
        // Find end position by searching for the last char
        let endPos = startPos;
        let charsFound = 0;
        for (let i = startPos; i < content.length && charsFound < searchText.length; i++) {
          if (!content[i].match(/\s/) || (charsFound > 0 && charsFound < searchText.length)) {
            endPos = i + 1;
          }
          if (!content[i].match(/\s/)) {
            charsFound++;
          }
        }

        matches.push({
          annotationId: annotation.id,
          start: startPos,
          end: Math.min(startPos + searchText.length + 10, content.length), // Approximate end
          type: annotation.type,
        });
      }
    }
  }

  // Sort by start position
  matches.sort((a, b) => a.start - b.start);

  return matches;
}

import { Suspense } from "react";
// ... existing imports ...

// Loading component
function WritePageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
    </div>
  );
}

function WritePageContent() {
  const {
    title,
    setTitle,
    content,
    setContent,
    aiPanelMode,
    setAiPanelMode,
    selectedAnnotationId,
    setSelectedAnnotationId,
    addToVocabulary,
    isInVocabulary,
  } = useWorkbenchStore();

  const searchParams = useSearchParams();

  const essayId = searchParams.get("id");

  const [formValues, setFormValues] = useState({
    topic: title,
    tone: "Academic",
    words: 280,
  });

  // Correction state
  const [correctionData, setCorrectionData] = useState<CorrectionPayload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  // Brainstorming state
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

  const [resolvedAnnotations, setResolvedAnnotations] = useState<string[]>([]);
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  // Essay saving states
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Mobile responsive states
  const [mobileTab, setMobileTab] = useState<"editor" | "ai">("editor");
  const [isMobile, setIsMobile] = useState(false);
  const [sheetAnnotation, setSheetAnnotation] = useState<Annotation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Load essay from ID
  useEffect(() => {
    async function loadEssay() {
      if (!essayId) return;

      try {
        const res = await getEssay(essayId);
        if (res.data) {
          setTitle(res.data.title);
          setContent(res.data.content);
          setCurrentEssayId(res.data.id);
          // If it has a score, maybe show correction panel?
          if (res.data.ai_score !== null) {
            setAiPanelMode('correct');
          }
        }
      } catch (error) {
        console.error('Failed to load essay:', error);
        // Toast or error handling could go here
      }
    }

    loadEssay();
  }, [essayId, setTitle, setContent, setCurrentEssayId, setAiPanelMode]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dictionary popover states
  const [wordPopover, setWordPopover] = useState<{
    visible: boolean;
    position: PopoverPosition;
    word: string;
    loading: boolean;
    data: WordLookupResult | null;
    error: string | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    word: "",
    loading: false,
    data: null,
    error: null,
  });

  // Translation popover state
  const [translationPopover, setTranslationPopover] = useState<{
    visible: boolean;
    position: PopoverPosition;
    loading: boolean;
    data: TranslationResult | null;
    error: string | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    loading: false,
    data: null,
    error: null,
  });

  // Synonyms popover state
  const [synonymsPopover, setSynonymsPopover] = useState<{
    visible: boolean;
    position: PopoverPosition;
    loading: boolean;
    data: SynonymsResult | null;
    error: string | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    loading: false,
    data: null,
    error: null,
  });

  // Pronunciation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Floating menu position - use ref to avoid re-renders during selection
  const [floatingMenuPosition, setFloatingMenuPosition] = useState<PopoverPosition>({ x: 0, y: 0 });
  const lastSelectionRef = useRef<{ start: number; end: number; text: string }>({ start: 0, end: 0, text: '' });
  const isSelectingRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightOverlayRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const annotationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const annotationListRef = useRef<HTMLDivElement | null>(null);

  // Use Vercel AI SDK's useCompletion for streaming
  const {
    completion,
    isLoading: isGenerating,
    complete,
    setCompletion,
  } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
  });

  useEffect(() => {
    if (correctionData?.annotations.length && !selectedAnnotationId) {
      setSelectedAnnotationId(correctionData.annotations[0].id);
    }
  }, [correctionData, selectedAnnotationId, setSelectedAnnotationId]);

  const normalizedContent = typeof content === "string" ? content : "";

  const wordCount = useMemo(() => {
    return normalizedContent.trim().length
      ? normalizedContent.split(/\s+/).filter(Boolean).length
      : 0;
  }, [normalizedContent]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const selectedAnnotation = correctionData?.annotations.find(
    (annotation) => annotation.id === selectedAnnotationId
  );

  // Calculate text matches for highlighting
  const textMatches = useMemo(() => {
    if (!correctionData?.annotations || aiPanelMode !== "correct") return [];
    return findTextMatches(normalizedContent, correctionData.annotations);
  }, [correctionData?.annotations, normalizedContent, aiPanelMode]);

  // Sync scroll between textarea and highlight overlay
  const handleTextareaScroll = useCallback(() => {
    if (textareaRef.current && highlightOverlayRef.current) {
      highlightOverlayRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightOverlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle highlight click - mobile: open sheet, desktop: scroll to annotation card
  const handleHighlightClick = useCallback((annotationId: string) => {
    setSelectedAnnotationId(annotationId);

    if (isMobile) {
      // Mobile: open bottom sheet with annotation details
      const annotation = correctionData?.annotations.find(a => a.id === annotationId);
      if (annotation) {
        setSheetAnnotation(annotation);
        setIsSheetOpen(true);
      }
    } else {
      // Desktop: scroll the annotation card into view
      requestAnimationFrame(() => {
        const annotationEl = annotationRefs.current[annotationId];
        if (annotationEl) {
          annotationEl.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    }
  }, [setSelectedAnnotationId, isMobile, correctionData?.annotations]);

  // Handle AI generation
  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;

    setCompletion('');

    await complete('', {
      body: {
        topic: formValues.topic,
        tone: formValues.tone,
        words: formValues.words,
      },
    });
  };

  // Handle correction analysis
  const handleAnalyze = async () => {
    if (isAnalyzing || !normalizedContent.trim()) return;

    setIsAnalyzing(true);
    setCorrectionError(null);
    setResolvedAnnotations([]);

    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: normalizedContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '批改失败');
      }

      const data: CorrectionPayload = await response.json();
      setCorrectionData(data);
      setSelectedAnnotationId(data.annotations[0]?.id || null);

      // 自动保存分数到数据库
      try {
        let targetId = currentEssayId;

        // 如果还没保存过文章，先创建
        if (!targetId) {
          const createRes = await createEssay({
            title: title || '无标题',
            content: normalizedContent,
          });
          if (createRes.data) {
            targetId = createRes.data.id;
            setCurrentEssayId(targetId);
            // 更新 URL，不刷新页面
            window.history.replaceState(null, '', `/write?id=${targetId}`);
          }
        }

        // 更新文章分数和反馈
        if (targetId) {
          await updateEssay(targetId, {
            content: normalizedContent, // 顺便保存最新内容
            ai_score: data.score,
            ai_feedback: {
              score: data.score,
              summary: data.summary,
              breakdown: data.breakdown,
              annotations: data.annotations,
            },
          });
        }
      } catch (saveError) {
        console.error('保存批改结果失败:', saveError);
        // 不阻断用户查看结果，但可以 console 记录
      }

    } catch (error) {
      setCorrectionError(error instanceof Error ? error.message : '批改服务暂时不可用');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle brainstorming
  const handleBrainstorm = async () => {
    if (isBrainstorming || !formValues.topic.trim()) return;

    setIsBrainstorming(true);
    setSuggestedTopics([]);

    try {
      const response = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: formValues.topic }),
      });

      if (!response.ok) {
        throw new Error('Brainstorm failed');
      }

      const data = await response.json();
      if (data.topics && Array.isArray(data.topics)) {
        setSuggestedTopics(data.topics);
      }
    } catch (error) {
      console.error('Brainstorm error:', error);
      // Optional: show toast/error
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleInsertToEditor = () => {
    if (!completion) return;
    setContent((prev) => `${prev.trim()}\n\n${completion}`.trim());
    setCompletion('');
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

  // Close all popovers
  const closeAllPopovers = useCallback(() => {
    setWordPopover(prev => ({ ...prev, visible: false }));
    setTranslationPopover(prev => ({ ...prev, visible: false }));
    setSynonymsPopover(prev => ({ ...prev, visible: false }));
    setSelectionActive(false);
  }, []);

  // Get caret coordinates in textarea using mirror div technique
  const getCaretCoordinates = useCallback((textarea: HTMLTextAreaElement, position: number) => {
    const style = window.getComputedStyle(textarea);
    const mirror = document.createElement('div');

    // Copy textarea styles to mirror
    const properties = [
      'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
      'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize',
      'whiteSpace', 'wordWrap', 'wordBreak'
    ];

    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';

    properties.forEach(prop => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mirror.style as any)[prop] = style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    });

    document.body.appendChild(mirror);

    const text = textarea.value.substring(0, position);
    mirror.textContent = text;

    const span = document.createElement('span');
    span.textContent = textarea.value.substring(position) || '.';
    mirror.appendChild(span);

    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();

    document.body.removeChild(mirror);

    return {
      left: rect.left + (spanRect.left - mirrorRect.left) - textarea.scrollLeft,
      top: rect.top + (spanRect.top - mirrorRect.top) - textarea.scrollTop,
    };
  }, []);

  // Handle mouse down - mark selection start
  const handleMouseDown = useCallback(() => {
    isSelectingRef.current = true;
  }, []);

  // Handle blur - close floating menu when textarea loses focus
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't close if focus moved to a popover button or any popover is open
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('.dictionary-popover')) {
      return;
    }
    // Don't close if any popover is visible (user might be interacting with it)
    if (wordPopover.visible || translationPopover.visible || synonymsPopover.visible) {
      return;
    }
    // Delay to allow button clicks to register
    setTimeout(() => {
      // Re-check popovers after delay
      if (wordPopover.visible || translationPopover.visible || synonymsPopover.visible) {
        return;
      }
      if (!textareaRef.current?.contains(document.activeElement) &&
        !document.activeElement?.closest('.dictionary-popover')) {
        setSelectionActive(false);
        setSelectedText("");
        lastSelectionRef.current = { start: 0, end: 0, text: '' };
      }
    }, 200);
  }, [wordPopover.visible, translationPopover.visible, synonymsPopover.visible]);

  // Handle mouse up - finalize selection and show menu
  const handleMouseUp = useCallback(() => {
    if (!textareaRef.current || !isSelectingRef.current) return;
    isSelectingRef.current = false;

    // Small delay to ensure selection is finalized
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      const hasSelection = selectionEnd - selectionStart > 0;

      if (hasSelection) {
        const selected = value.substring(selectionStart, selectionEnd).trim();

        // Only update if selection actually changed
        if (
          lastSelectionRef.current.start === selectionStart &&
          lastSelectionRef.current.end === selectionEnd
        ) {
          return;
        }

        lastSelectionRef.current = { start: selectionStart, end: selectionEnd, text: selected };
        setSelectedText(selected);

        // Calculate position using mirror div technique
        const textarea = textareaRef.current;
        const coords = getCaretCoordinates(textarea, selectionStart);
        const endCoords = getCaretCoordinates(textarea, selectionEnd);

        // Position menu at the middle of selection, above it
        const menuX = Math.max(10, Math.min((coords.left + endCoords.left) / 2 - 100, window.innerWidth - 280));
        const menuY = Math.max(10, coords.top - 50);

        setFloatingMenuPosition({ x: menuX, y: menuY });
        setSelectionActive(true);

        // Close other popovers when new selection is made
        setWordPopover(prev => ({ ...prev, visible: false }));
        setTranslationPopover(prev => ({ ...prev, visible: false }));
        setSynonymsPopover(prev => ({ ...prev, visible: false }));
      } else {
        lastSelectionRef.current = { start: 0, end: 0, text: '' };
        setSelectionActive(false);
        setSelectedText("");
      }
    });
  }, [getCaretCoordinates]);

  // Handle double click for word lookup
  const handleDoubleClick = useCallback(async (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Wait for selection to be set
    await new Promise(resolve => setTimeout(resolve, 10));

    const { selectionStart, selectionEnd, value } = textarea;
    if (selectionEnd - selectionStart === 0) return;

    const word = value.substring(selectionStart, selectionEnd).trim();

    // Only lookup single words (no spaces)
    if (!word || word.includes(' ') || !/^[a-zA-Z'-]+$/.test(word)) return;

    // Get position using caret coordinates
    const coords = getCaretCoordinates(textarea, selectionStart);
    const popoverWidth = 380;
    const popoverHeight = 420;
    const margin = 10;

    // Calculate x position, ensure it stays within viewport
    let x = Math.max(margin, Math.min(coords.left, window.innerWidth - popoverWidth - margin));

    // Calculate y position - prefer below selection, but go above if not enough space
    let y = coords.top + 30;
    if (y + popoverHeight > window.innerHeight - margin) {
      // Not enough space below, show above
      y = Math.max(margin, coords.top - popoverHeight - 10);
    }

    // Close other popovers
    setTranslationPopover(prev => ({ ...prev, visible: false }));
    setSynonymsPopover(prev => ({ ...prev, visible: false }));
    setSelectionActive(false);

    // Show loading state
    setWordPopover({
      visible: true,
      position: { x, y },
      word,
      loading: true,
      data: null,
      error: null,
    });

    // Get context (surrounding sentence)
    const contextStart = Math.max(0, value.lastIndexOf('.', selectionStart - 50) + 1);
    const contextEnd = Math.min(value.length, value.indexOf('.', selectionEnd + 50) + 1 || value.length);
    const context = value.substring(contextStart, contextEnd).trim();

    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', text: word, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '查询失败');
      }

      const data: WordLookupResult = await response.json();
      setWordPopover(prev => ({
        ...prev,
        loading: false,
        data,
      }));
    } catch (error) {
      setWordPopover(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '查词服务暂时不可用',
      }));
    }
  }, [getCaretCoordinates]);

  // Handle translate button click
  const handleTranslate = useCallback(async () => {
    if (!selectedText) return;

    // Calculate position - prefer below floating menu, but go above if not enough space
    const popoverWidth = 420;
    const popoverHeight = 280;
    const margin = 10;

    let x = Math.max(margin, Math.min(floatingMenuPosition.x, window.innerWidth - popoverWidth - margin));
    let y = floatingMenuPosition.y + 50;

    // If not enough space below, show above the floating menu
    if (y + popoverHeight > window.innerHeight - margin) {
      y = Math.max(margin, floatingMenuPosition.y - popoverHeight - 10);
    }

    // Close other popovers
    setWordPopover(prev => ({ ...prev, visible: false }));
    setSynonymsPopover(prev => ({ ...prev, visible: false }));
    setSelectionActive(false);

    // Show loading state
    setTranslationPopover({
      visible: true,
      position: { x, y },
      loading: true,
      data: null,
      error: null,
    });

    // Get context
    const textarea = textareaRef.current;
    const context = textarea ? textarea.value.substring(
      Math.max(0, textarea.selectionStart - 100),
      Math.min(textarea.value.length, textarea.selectionEnd + 100)
    ) : "";

    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', text: selectedText, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '翻译失败');
      }

      const data: TranslationResult = await response.json();
      setTranslationPopover(prev => ({
        ...prev,
        loading: false,
        data,
      }));
    } catch (error) {
      setTranslationPopover(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '翻译服务暂时不可用',
      }));
    }
  }, [selectedText, floatingMenuPosition]);

  // Handle Ask AI button click
  const handleAskAI = useCallback(() => {
    if (!selectedText) return;

    // Switch to generate mode and set selected text as topic
    setAiPanelMode("generate");
    setFormValues(prev => ({
      ...prev,
      topic: selectedText,
    }));

    // Close popovers
    closeAllPopovers();
  }, [selectedText, setAiPanelMode, closeAllPopovers]);

  // Handle synonyms button click
  const handleSynonyms = useCallback(async () => {
    if (!selectedText) return;

    // Calculate position - prefer below floating menu, but go above if not enough space
    const popoverWidth = 440;
    const popoverHeight = 400;
    const margin = 10;

    let x = Math.max(margin, Math.min(floatingMenuPosition.x, window.innerWidth - popoverWidth - margin));
    let y = floatingMenuPosition.y + 50;

    // If not enough space below, show above the floating menu
    if (y + popoverHeight > window.innerHeight - margin) {
      y = Math.max(margin, floatingMenuPosition.y - popoverHeight - 10);
    }

    // Close other popovers
    setWordPopover(prev => ({ ...prev, visible: false }));
    setTranslationPopover(prev => ({ ...prev, visible: false }));
    setSelectionActive(false);

    // Show loading state
    setSynonymsPopover({
      visible: true,
      position: { x, y },
      loading: true,
      data: null,
      error: null,
    });

    // Get context
    const textarea = textareaRef.current;
    const context = textarea ? textarea.value.substring(
      Math.max(0, textarea.selectionStart - 100),
      Math.min(textarea.value.length, textarea.selectionEnd + 100)
    ) : "";

    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'synonyms', text: selectedText, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '查询失败');
      }

      const data: SynonymsResult = await response.json();
      setSynonymsPopover(prev => ({
        ...prev,
        loading: false,
        data,
      }));
    } catch (error) {
      setSynonymsPopover(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '同义词服务暂时不可用',
      }));
    }
  }, [selectedText, floatingMenuPosition]);

  // Add word to vocabulary (save to backend)
  const handleAddToVocabulary = useCallback(async () => {
    if (!wordPopover.data) return;

    const contextSentence = normalizedContent.substring(
      Math.max(0, normalizedContent.toLowerCase().indexOf(wordPopover.data.word.toLowerCase()) - 50),
      Math.min(normalizedContent.length, normalizedContent.toLowerCase().indexOf(wordPopover.data.word.toLowerCase()) + wordPopover.data.word.length + 50)
    );

    // First add to local store for immediate UI feedback
    addToVocabulary({
      word: wordPopover.data.word,
      phonetic: wordPopover.data.phonetic,
      definitions: wordPopover.data.definitions,
      synonyms: wordPopover.data.synonyms,
      context: contextSentence,
    });

    // Then save to backend
    try {
      await addVocabulary({
        word: wordPopover.data.word,
        phonetic: wordPopover.data.phonetic,
        definition: wordPopover.data.definitions.map(d => `${d.pos}: ${d.meaning}`).join('; '),
        context_sentence: contextSentence,
        part_of_speech: wordPopover.data.partOfSpeech,
        synonyms: wordPopover.data.synonyms,
      });
    } catch (error) {
      console.error('保存生词到后端失败:', error);
      // Word is still saved locally, so we don't need to show an error
    }
  }, [wordPopover.data, addToVocabulary, normalizedContent]);

  // Save essay to backend
  const handleSaveEssay = useCallback(async () => {
    if (!title.trim() && !normalizedContent.trim()) {
      setSaveError('请输入标题或内容');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (currentEssayId) {
        // Update existing essay
        await updateEssay(currentEssayId, {
          title: title.trim() || '无标题',
          content: normalizedContent,
        });
      } else {
        // Create new essay
        const response = await createEssay({
          title: title.trim() || '无标题',
          content: normalizedContent,
        });
        if (response.data?.id) {
          setCurrentEssayId(response.data.id);
        }
      }
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [title, normalizedContent, currentEssayId]);

  // Copy text to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Close popovers when clicking outside (use click event to avoid interfering with selection)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside a popover or textarea
      if (target.closest('.dictionary-popover') || target.closest('textarea')) {
        return;
      }
      // Only close word/translation/synonyms popovers, not the floating menu
      // (floating menu is controlled by selection state)
      setWordPopover(prev => ({ ...prev, visible: false }));
      setTranslationPopover(prev => ({ ...prev, visible: false }));
      setSynonymsPopover(prev => ({ ...prev, visible: false }));
    };

    // Use click instead of mousedown to avoid interfering with text selection
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle pronunciation play
  const handlePlayPronunciation = useCallback(() => {
    if (!wordPopover.data?.word || isPlayingAudio) return;

    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(wordPopover.data.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [wordPopover.data, isPlayingAudio]);

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
            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveEssay}
              disabled={isSaving}
              className="neu-button-accent px-4 py-2.5 text-sm font-medium flex items-center gap-2"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? '保存中...' : '保存'}
            </motion.button>

            {/* Last saved indicator */}
            {lastSavedAt && (
              <span className="text-xs self-center" style={{ color: "var(--muted)" }}>
                已保存 {lastSavedAt.toLocaleTimeString()}
              </span>
            )}

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

      {/* Mobile Bottom Tab Bar */}
      {isMobile && !focusMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <div className="neu-float mx-4 mb-4 p-1.5 rounded-2xl">
            <div className="grid grid-cols-2 gap-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setMobileTab("editor")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  mobileTab === "editor"
                    ? "text-white shadow-md"
                    : "text-muted hover:text-foreground"
                )}
                style={mobileTab === "editor" ? {
                  background: "linear-gradient(145deg, var(--accent-light), var(--accent))"
                } : {}}
              >
                <Edit3 className="h-4 w-4" />
                编辑器
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setMobileTab("ai")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  mobileTab === "ai"
                    ? "text-white shadow-md"
                    : "text-muted hover:text-foreground"
                )}
                style={mobileTab === "ai" ? {
                  background: "linear-gradient(145deg, var(--accent-light), var(--accent))"
                } : {}}
              >
                <MessageSquare className="h-4 w-4" />
                AI 反馈
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Annotation Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="neu-float rounded-t-3xl max-h-[70vh] overflow-hidden">
          {sheetAnnotation && (
            <>
              <SheetHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="badge-neu text-[10px]"
                    style={{
                      background: typeStyles[sheetAnnotation.type]?.bg,
                      color: typeStyles[sheetAnnotation.type]?.color
                    }}
                  >
                    {typeStyles[sheetAnnotation.type]?.label}
                  </span>
                  <SheetTitle className="text-sm">修改建议</SheetTitle>
                </div>
                <SheetDescription className="sr-only">
                  AI 为你的文本提供的修改建议
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6 overflow-y-auto">
                {/* Original Text */}
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>原句</p>
                  <div
                    className="neu-inset p-3 rounded-xl"
                    style={{ borderLeft: `3px solid ${typeStyles[sheetAnnotation.type]?.color}` }}
                  >
                    <p className="text-sm line-through opacity-70">{sheetAnnotation.originalText}</p>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>建议修改为</p>
                  <div
                    className="neu-raised p-3 rounded-xl"
                    style={{ borderLeft: `3px solid var(--success)` }}
                  >
                    <p className="text-sm font-medium" style={{ color: typeStyles[sheetAnnotation.type]?.color }}>
                      {sheetAnnotation.suggestion}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--muted)" }}>修改原因</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {sheetAnnotation.reason}
                  </p>
                </div>

                {/* Action Buttons */}
                {!resolvedAnnotations.includes(sheetAnnotation.id) && (
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleAcceptAnnotation(sheetAnnotation);
                        setIsSheetOpen(false);
                      }}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(145deg, var(--success), #16a34a)" }}
                    >
                      <Check className="h-4 w-4" />
                      接受修改
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleRejectAnnotation(sheetAnnotation);
                        setIsSheetOpen(false);
                      }}
                      className="flex-1 neu-button py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      保留原文
                    </motion.button>
                  </div>
                )}

                {resolvedAnnotations.includes(sheetAnnotation.id) && (
                  <div className="neu-inset p-3 rounded-xl text-center">
                    <span className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--success)" }}>
                      <Check className="h-4 w-4" />
                      已处理
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[1.2fr_0.8fr]",
        isMobile && !focusMode && "pb-24" // Add padding for bottom tab bar on mobile
      )}>
        {/* Editor Panel */}
        <motion.div
          layout
          ref={editorContainerRef}
          className={cn(
            "neu-float p-6 space-y-5 relative",
            isMobile && mobileTab !== "editor" && "hidden"
          )}
        >
          {/* Floating Menu for Selection */}
          <AnimatePresence>
            {selectionActive && selectedText && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed dictionary-popover"
                style={{
                  left: floatingMenuPosition.x,
                  top: floatingMenuPosition.y,
                  zIndex: 9999,
                }}
              >
                <div className="neu-raised flex items-center gap-1 p-2 rounded-xl shadow-lg">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleAskAI}
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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleTranslate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-background-elevated transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    <Languages className="h-3.5 w-3.5" />
                    翻译
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSynonyms}
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

          {/* Word Lookup Popover */}
          <AnimatePresence>
            {wordPopover.visible && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed dictionary-popover"
                style={{
                  left: wordPopover.position.x,
                  top: wordPopover.position.y,
                  maxWidth: '360px',
                  width: '360px',
                  zIndex: 10000,
                }}
              >
                <div className="neu-raised p-4 rounded-2xl space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        词典
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setWordPopover(prev => ({ ...prev, visible: false }))}
                      className="p-1 rounded-full hover:bg-background-elevated transition-colors"
                    >
                      <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
                    </motion.button>
                  </div>

                  {/* Loading State */}
                  {wordPopover.loading && (
                    <div className="flex items-center justify-center py-8">
                      <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
                    </div>
                  )}

                  {/* Error State */}
                  {wordPopover.error && (
                    <div className="neu-inset p-3 rounded-xl text-center">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2" style={{ color: "var(--error)" }} />
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{wordPopover.error}</p>
                    </div>
                  )}

                  {/* Word Data */}
                  {wordPopover.data && (
                    <>
                      {/* Word and Phonetic */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold serif">{wordPopover.data.word}</h3>
                          <p className="text-sm" style={{ color: "var(--muted)" }}>
                            {wordPopover.data.phonetic}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePlayPronunciation}
                            className="p-2 neu-button rounded-full relative overflow-hidden"
                            title="发音"
                          >
                            <Volume2
                              className={cn("h-4 w-4 transition-colors", isPlayingAudio && "text-accent animate-pulse")}
                              style={{ color: isPlayingAudio ? "var(--accent)" : "var(--accent)" }}
                            />
                            {isPlayingAudio && (
                              <span className="absolute inset-0 bg-accent/10 animate-ping rounded-full" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddToVocabulary}
                            className={cn(
                              "p-2 rounded-full transition-all",
                              isInVocabulary(wordPopover.data.word)
                                ? "neu-button-accent"
                                : "neu-button"
                            )}
                            title={isInVocabulary(wordPopover.data.word) ? "已收藏" : "添加到词汇本"}
                          >
                            {isInVocabulary(wordPopover.data.word) ? (
                              <Star className="h-4 w-4 text-white fill-white" />
                            ) : (
                              <StarOff className="h-4 w-4" style={{ color: "var(--muted)" }} />
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* Part of Speech */}
                      <div className="flex flex-wrap gap-1.5">
                        {wordPopover.data.partOfSpeech.map((pos, i) => (
                          <span key={i} className="badge-neu text-[10px]">
                            {pos}
                          </span>
                        ))}
                      </div>

                      {/* Definitions */}
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {wordPopover.data.definitions.map((def, i) => (
                          <div key={i} className="neu-inset p-3 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                                {def.pos}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{def.meaning}</p>
                            <p className="text-xs italic" style={{ color: "var(--muted)" }}>
                              {def.example}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                              {def.exampleTranslation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Synonyms */}
                      {wordPopover.data.synonyms.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs" style={{ color: "var(--muted)" }}>同义词</p>
                          <div className="flex flex-wrap gap-1.5">
                            {wordPopover.data.synonyms.map((syn, i) => (
                              <span key={i} className="badge-neu text-[10px]" style={{ color: "var(--accent)" }}>
                                {syn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Antonyms */}
                      {wordPopover.data.antonyms.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs" style={{ color: "var(--muted)" }}>反义词</p>
                          <div className="flex flex-wrap gap-1.5">
                            {wordPopover.data.antonyms.map((ant, i) => (
                              <span key={i} className="badge-neu text-[10px]" style={{ color: "var(--error)" }}>
                                {ant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Translation Popover */}
          <AnimatePresence>
            {translationPopover.visible && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed dictionary-popover"
                style={{
                  left: translationPopover.position.x,
                  top: translationPopover.position.y,
                  maxWidth: '400px',
                  width: '400px',
                  zIndex: 10000,
                }}
              >
                <div className="neu-raised p-4 rounded-2xl space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        翻译
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTranslationPopover(prev => ({ ...prev, visible: false }))}
                      className="p-1 rounded-full hover:bg-background-elevated transition-colors"
                    >
                      <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
                    </motion.button>
                  </div>

                  {/* Loading State */}
                  {translationPopover.loading && (
                    <div className="flex items-center justify-center py-8">
                      <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
                    </div>
                  )}

                  {/* Error State */}
                  {translationPopover.error && (
                    <div className="neu-inset p-3 rounded-xl text-center">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2" style={{ color: "var(--error)" }} />
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{translationPopover.error}</p>
                    </div>
                  )}

                  {/* Translation Data */}
                  {translationPopover.data && (
                    <>
                      {/* Original Text */}
                      <div className="neu-inset p-3 rounded-xl">
                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>原文</p>
                        <p className="text-sm">{translationPopover.data.originalText}</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ChevronRight className="h-5 w-5 rotate-90" style={{ color: "var(--accent)" }} />
                      </div>

                      {/* Translation */}
                      <div className="neu-inset p-3 rounded-xl" style={{ borderLeft: "3px solid var(--accent)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs" style={{ color: "var(--muted)" }}>译文</p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(translationPopover.data?.translation || '')}
                            className="p-1 rounded-full hover:bg-background-elevated transition-colors"
                            title="复制"
                          >
                            <Copy className="h-3.5 w-3.5" style={{ color: "var(--muted)" }} />
                          </motion.button>
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                          {translationPopover.data.translation}
                        </p>
                      </div>

                      {/* Explanation */}
                      {translationPopover.data.explanation && (
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          💡 {translationPopover.data.explanation}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Synonyms Popover */}
          <AnimatePresence>
            {synonymsPopover.visible && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed dictionary-popover"
                style={{
                  left: synonymsPopover.position.x,
                  top: synonymsPopover.position.y,
                  maxWidth: '420px',
                  width: '420px',
                  zIndex: 10000,
                }}
              >
                <div className="neu-raised p-4 rounded-2xl space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" style={{ color: "var(--accent)" }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        同义词查询
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSynonymsPopover(prev => ({ ...prev, visible: false }))}
                      className="p-1 rounded-full hover:bg-background-elevated transition-colors"
                    >
                      <X className="h-4 w-4" style={{ color: "var(--muted)" }} />
                    </motion.button>
                  </div>

                  {/* Loading State */}
                  {synonymsPopover.loading && (
                    <div className="flex items-center justify-center py-8">
                      <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
                    </div>
                  )}

                  {/* Error State */}
                  {synonymsPopover.error && (
                    <div className="neu-inset p-3 rounded-xl text-center">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2" style={{ color: "var(--error)" }} />
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{synonymsPopover.error}</p>
                    </div>
                  )}

                  {/* Synonyms Data */}
                  {synonymsPopover.data && (
                    <>
                      {/* Original Word */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: "var(--muted)" }}>查询词：</span>
                        <span className="text-lg font-semibold serif" style={{ color: "var(--accent)" }}>
                          {synonymsPopover.data.word}
                        </span>
                      </div>

                      {/* Synonyms List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {synonymsPopover.data.synonyms.map((syn, i) => {
                          const style = similarityColors[syn.similarity];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="neu-inset p-3 rounded-xl"
                              style={{ borderLeft: `3px solid ${style.color}` }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-medium">{syn.word}</span>
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background: style.bg, color: style.color }}
                                >
                                  {style.label}
                                </span>
                              </div>
                              <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                                {syn.usage}
                              </p>
                              <p className="text-xs italic" style={{ color: "var(--muted)" }}>
                                "{syn.example}"
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  // Replace selected text with synonym
                                  if (textareaRef.current) {
                                    const { selectionStart, selectionEnd, value } = textareaRef.current;
                                    const newContent = value.substring(0, selectionStart) + syn.word + value.substring(selectionEnd);
                                    setContent(newContent);
                                    setSynonymsPopover(prev => ({ ...prev, visible: false }));
                                  }
                                }}
                                className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-medium neu-button flex items-center justify-center gap-1"
                              >
                                <ArrowUpRight className="h-3 w-3" />
                                替换使用
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  )}
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
            <div className="relative" style={{ background: 'var(--background)' }}>
              {/* Highlight Overlay Layer */}
              {aiPanelMode === "correct" && textMatches.length > 0 && (
                <div
                  ref={highlightOverlayRef}
                  className="highlight-overlay"
                  aria-hidden="true"
                >
                  {(() => {
                    const segments: React.ReactNode[] = [];
                    let lastEnd = 0;

                    // Filter out resolved annotations
                    const activeMatches = textMatches.filter(
                      m => !resolvedAnnotations.includes(m.annotationId)
                    );

                    activeMatches.forEach((match, index) => {
                      // Add text before this match
                      if (match.start > lastEnd) {
                        segments.push(
                          <span key={`text-${index}`}>
                            {normalizedContent.substring(lastEnd, match.start)}
                          </span>
                        );
                      }

                      // Add highlighted match
                      const isSelected = selectedAnnotationId === match.annotationId;
                      const style = typeStyles[match.type];

                      segments.push(
                        <span
                          key={`match-${match.annotationId}`}
                          onClick={() => handleHighlightClick(match.annotationId)}
                          className={cn(
                            "highlight-mark",
                            `highlight-${match.type}`,
                            isSelected && "selected"
                          )}
                          data-tooltip={`${style?.label || '批注'} - 点击查看详情`}
                        >
                          {normalizedContent.substring(match.start, match.end)}
                        </span>
                      );

                      lastEnd = match.end;
                    });

                    // Add remaining text
                    if (lastEnd < normalizedContent.length) {
                      segments.push(
                        <span key="text-end">
                          {normalizedContent.substring(lastEnd)}
                        </span>
                      );
                    }

                    return segments;
                  })()}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={normalizedContent}
                onChange={(event) => setContent(event.target.value)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onBlur={handleBlur}
                onDoubleClick={handleDoubleClick}
                onScroll={handleTextareaScroll}
                className={cn(
                  "neu-input w-full min-h-[400px] p-5 text-sm leading-8 resize-none serif relative",
                  aiPanelMode === "correct" && textMatches.length > 0 && "editor-with-highlights"
                )}
                placeholder="开始你的写作...

💡 提示：
• 双击任意单词可查看释义、音标和例句
• 选中文本后可使用翻译和同义词功能
• 点击星标可将单词添加到词汇本"
              />
            </div>
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
          {aiPanelMode === "correct" && correctionData && (
            <div className="flex flex-wrap gap-2 pt-2">
              {correctionData.annotations.map((annotation) => {
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
          {!focusMode && (!isMobile || mobileTab === "ai") && (
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 20 }}
              className={cn(
                "neu-float p-6 space-y-5 h-fit",
                !isMobile && "lg:sticky lg:top-24"
              )}
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
                        <div className="relative">
                          <input
                            value={formValues.topic}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, topic: e.target.value }))}
                            className="neu-input w-full px-4 py-3 text-sm pr-12"
                            placeholder="输入主题..."
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBrainstorm}
                            disabled={isBrainstorming || !formValues.topic.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted hover:text-accent disabled:opacity-50"
                            title="AI 构思灵感"
                          >
                            {isBrainstorming ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Lightbulb className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* Suggested Topics */}
                      <AnimatePresence>
                        {suggestedTopics.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 mb-2">
                              <span className="text-xs" style={{ color: "var(--muted)" }}>AI 推荐主题</span>
                              <div className="flex flex-col gap-2">
                                {suggestedTopics.map((topic, index) => (
                                  <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    type="button"
                                    onClick={() => setFormValues(prev => ({ ...prev, topic }))}
                                    className="neu-button p-3 text-left text-xs hover:text-accent transition-colors"
                                  >
                                    {topic}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
                            <option>Polite</option>
                            <option>Neutral</option>
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
                        {isGenerating && (
                          <span className="badge-accent text-[10px]">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                            Streaming
                          </span>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {!completion ? (
                          <p className="text-sm" style={{ color: "var(--muted)" }}>
                            点击"触发生成"后，AI 将实时流式输出文章内容。
                          </p>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="neu-raised p-3 rounded-xl"
                          >
                            <p className="text-sm serif leading-relaxed whitespace-pre-wrap">
                              {completion}
                              {isGenerating && <span className="typing-cursor" />}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {completion && !isGenerating && (
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" style={{ color: "var(--accent)" }} />
                        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          Correction
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !normalizedContent.trim()}
                        className="neu-button-accent px-4 py-2 text-xs font-medium flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            分析文章
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Error State */}
                    {correctionError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="neu-inset p-4 rounded-2xl"
                        style={{ borderLeft: "3px solid var(--error)" }}
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" style={{ color: "var(--error)" }} />
                          <span className="text-sm">{correctionError}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {!correctionData && !isAnalyzing && !correctionError && (
                      <div className="neu-inset p-6 rounded-2xl text-center">
                        <Target className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--muted)" }} />
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          在左侧编辑器输入文章后，点击"分析文章"按钮获取 AI 批改反馈
                        </p>
                      </div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                      <div className="neu-inset p-6 rounded-2xl text-center">
                        <LoaderCircle className="h-10 w-10 mx-auto mb-3 animate-spin" style={{ color: "var(--accent)" }} />
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          AI 正在分析你的文章，请稍候...
                        </p>
                      </div>
                    )}

                    {/* Score Dashboard */}
                    {correctionData && (
                      <>
                        <div className="neu-inset p-5 rounded-2xl text-center">
                          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>综合得分</p>
                          <p className="serif text-5xl font-medium" style={{ color: "var(--accent)" }}>
                            {correctionData.score}
                          </p>
                          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                            {correctionData.summary}
                          </p>

                          {/* Score Breakdown */}
                          <div className="mt-5 space-y-3">
                            {correctionData.breakdown.map((item) => (
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
                        <div
                          ref={annotationListRef}
                          className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scroll-smooth"
                        >
                          {correctionData.annotations.map((annotation, index) => {
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
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Error Toast */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 neu-raised p-4 rounded-xl z-50"
            style={{ borderLeft: "3px solid var(--error)" }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" style={{ color: "var(--error)" }} />
              <span className="text-sm">{saveError}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSaveError(null)}
                className="ml-2 p-1 rounded-full hover:bg-background-elevated"
              >
                <X className="h-3 w-3" style={{ color: "var(--muted)" }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<WritePageSkeleton />}>
      <WritePageContent />
    </Suspense>
  );
}
