import { create } from "zustand";

interface BatchItem {
  imageId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

interface BatchState {
  queue: BatchItem[];
  isRunning: boolean;
  presetId: string | null;
  outputDir: string;
  outputFormat: "jpeg" | "png" | "tiff";
  quality: number;
  addWatermark: boolean;

  addToQueue: (imageIds: string[]) => void;
  removeFromQueue: (imageId: string) => void;
  clearQueue: () => void;
  setPresetId: (id: string) => void;
  setOutputDir: (dir: string) => void;
  setOutputFormat: (format: "jpeg" | "png" | "tiff") => void;
  setQuality: (quality: number) => void;
  setWatermark: (enabled: boolean) => void;
  setRunning: (running: boolean) => void;
  updateItem: (imageId: string, update: Partial<BatchItem>) => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  queue: [],
  isRunning: false,
  presetId: null,
  outputDir: "",
  outputFormat: "jpeg",
  quality: 90,
  addWatermark: false,

  addToQueue: (imageIds) =>
    set((state) => ({
      queue: [
        ...state.queue,
        ...imageIds
          .filter((id) => !state.queue.some((item) => item.imageId === id))
          .map((imageId) => ({
            imageId,
            status: "pending" as const,
            progress: 0,
          })),
      ],
    })),

  removeFromQueue: (imageId) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.imageId !== imageId),
    })),

  clearQueue: () => set({ queue: [], isRunning: false }),

  setPresetId: (presetId) => set({ presetId }),
  setOutputDir: (outputDir) => set({ outputDir }),
  setOutputFormat: (outputFormat) => set({ outputFormat }),
  setQuality: (quality) => set({ quality }),
  setWatermark: (addWatermark) => set({ addWatermark }),
  setRunning: (isRunning) => set({ isRunning }),

  updateItem: (imageId, update) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.imageId === imageId ? { ...item, ...update } : item
      ),
    })),
}));
