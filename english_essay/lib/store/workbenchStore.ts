import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AiPanelMode = "generate" | "correct";

// Vocabulary item type
export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  definitions: {
    pos: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
  }[];
  synonyms: string[];
  context?: string; // Original context where the word was found
  addedAt: number;
}

interface WorkbenchState {
  title: string;
  content: string;
  aiPanelMode: AiPanelMode;
  isGenerating: boolean;
  selectedAnnotationId: string | null;
  vocabulary: VocabularyItem[];
  setTitle: (value: string) => void;
  setContent: (value: string | ((prev: string) => string)) => void;
  setAiPanelMode: (mode: AiPanelMode) => void;
  setIsGenerating: (value: boolean) => void;
  setSelectedAnnotationId: (id: string | null) => void;
  addToVocabulary: (item: Omit<VocabularyItem, "id" | "addedAt">) => void;
  removeFromVocabulary: (id: string) => void;
  isInVocabulary: (word: string) => boolean;
  reset: () => void;
}

const defaultTitle = "";

export const useWorkbenchStore = create<WorkbenchState>()(
  persist(
    (set, get) => ({
      title: defaultTitle,
      content: "",
      aiPanelMode: "generate",
      isGenerating: false,
      selectedAnnotationId: null,
      vocabulary: [],
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
      addToVocabulary: (item) =>
        set((state) => {
          // Check if word already exists
          const exists = state.vocabulary.some(
            (v) => v.word.toLowerCase() === item.word.toLowerCase()
          );
          if (exists) return state;
          
          const newItem: VocabularyItem = {
            ...item,
            id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: Date.now(),
          };
          return { vocabulary: [...state.vocabulary, newItem] };
        }),
      removeFromVocabulary: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((v) => v.id !== id),
        })),
      isInVocabulary: (word) => {
        const state = get();
        return state.vocabulary.some(
          (v) => v.word.toLowerCase() === word.toLowerCase()
        );
      },
      reset: () =>
        set({
          title: defaultTitle,
          content: "",
          aiPanelMode: "generate",
          isGenerating: false,
          selectedAnnotationId: null,
          // Keep vocabulary on reset
        }),
    }),
    {
      name: "workbench-storage",
      partialize: (state) => ({ vocabulary: state.vocabulary }),
    }
  )
);
