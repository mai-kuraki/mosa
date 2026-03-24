import { create } from "zustand";

interface SettingsState {
  exportFormat: "jpeg" | "png" | "tiff";
  exportQuality: number;
  watermarkEnabled: boolean;
  watermarkPath: string;
  watermarkPosition: string;
  watermarkOpacity: number;
  language: string;

  setExportFormat: (format: "jpeg" | "png" | "tiff") => void;
  setExportQuality: (quality: number) => void;
  setWatermarkEnabled: (enabled: boolean) => void;
  setWatermarkPath: (path: string) => void;
  setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  exportFormat: "jpeg",
  exportQuality: 90,
  watermarkEnabled: false,
  watermarkPath: "",
  watermarkPosition: "bottom-right",
  watermarkOpacity: 0.8,
  language: "zh-CN",

  setExportFormat: (exportFormat) => set({ exportFormat }),
  setExportQuality: (exportQuality) => set({ exportQuality }),
  setWatermarkEnabled: (watermarkEnabled) => set({ watermarkEnabled }),
  setWatermarkPath: (watermarkPath) => set({ watermarkPath }),
  setLanguage: (language) => set({ language }),
}));
