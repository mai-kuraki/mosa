import { create } from "zustand";
import type { PresetId } from "@mosa/render-engine/src/presets/preset.types";

interface EditRecipe {
  presetId: PresetId | null;
  params: Record<string, unknown>;
}

interface EditorState {
  currentImageId: string | null;
  recipe: EditRecipe;
  previewUrl: string | null;
  isProcessing: boolean;
  historyStack: EditRecipe[];
  futureStack: EditRecipe[];

  setCurrentImage: (imageId: string | null) => void;
  applyPreset: (presetId: PresetId) => void;
  setPreviewUrl: (url: string | null) => void;
  setProcessing: (processing: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetToOriginal: () => void;
}

const emptyRecipe: EditRecipe = { presetId: null, params: {} };
const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  currentImageId: null,
  recipe: { ...emptyRecipe },
  previewUrl: null,
  isProcessing: false,
  historyStack: [],
  futureStack: [],

  setCurrentImage: (imageId) =>
    set({
      currentImageId: imageId,
      recipe: { ...emptyRecipe },
      previewUrl: null,
      historyStack: [],
      futureStack: [],
    }),

  applyPreset: (presetId) =>
    set((state) => {
      const newHistory = [...state.historyStack, state.recipe].slice(-MAX_HISTORY);
      return {
        recipe: { presetId, params: {} },
        historyStack: newHistory,
        futureStack: [],
      };
    }),

  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setProcessing: (isProcessing) => set({ isProcessing }),

  undo: () =>
    set((state) => {
      if (state.historyStack.length === 0) return state;
      const previous = state.historyStack[state.historyStack.length - 1];
      return {
        recipe: previous,
        historyStack: state.historyStack.slice(0, -1),
        futureStack: [state.recipe, ...state.futureStack],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.futureStack.length === 0) return state;
      const next = state.futureStack[0];
      return {
        recipe: next,
        historyStack: [...state.historyStack, state.recipe],
        futureStack: state.futureStack.slice(1),
      };
    }),

  resetToOriginal: () =>
    set((state) => ({
      recipe: { ...emptyRecipe },
      historyStack: [...state.historyStack, state.recipe],
      futureStack: [],
    })),
}));
