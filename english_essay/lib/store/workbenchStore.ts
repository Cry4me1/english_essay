import { create } from "zustand";
import { initialEssayDraft } from "@/lib/mockData";

export type AiPanelMode = "generate" | "correct";

interface WorkbenchState {
  title: string;
  content: string;
  aiPanelMode: AiPanelMode;
  isGenerating: boolean;
  selectedAnnotationId: string | null;
  setTitle: (value: string) => void;
  setContent: (value: string | ((prev: string) => string)) => void;
  setAiPanelMode: (mode: AiPanelMode) => void;
  setIsGenerating: (value: boolean) => void;
  setSelectedAnnotationId: (id: string | null) => void;
  reset: () => void;
}

const defaultTitle = "Should cities still invest in public libraries?";

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  title: defaultTitle,
  content: initialEssayDraft,
  aiPanelMode: "generate",
  isGenerating: false,
  selectedAnnotationId: null,
  setTitle: (title) => set({ title }),
  setContent: (updater) =>
    set((state) => {
      const previous =
        typeof state.content === "string" ? state.content : "";
      const next =
        typeof updater === "function" ? updater(previous) : updater;
      return { content: next };
    }),
  setAiPanelMode: (aiPanelMode) => set({ aiPanelMode }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSelectedAnnotationId: (selectedAnnotationId) => set({ selectedAnnotationId }),
  reset: () =>
    set({
      title: defaultTitle,
      content: initialEssayDraft,
      aiPanelMode: "generate",
      isGenerating: false,
      selectedAnnotationId: null,
    }),
}));

