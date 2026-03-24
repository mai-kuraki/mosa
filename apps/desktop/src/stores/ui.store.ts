import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  activePanel: "style" | "exif" | "export" | null;
  zoomLevel: number;
  viewMode: "grid" | "detail";

  toggleSidebar: () => void;
  setActivePanel: (panel: "style" | "exif" | "export" | null) => void;
  setZoomLevel: (zoom: number) => void;
  setViewMode: (mode: "grid" | "detail") => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activePanel: "style",
  zoomLevel: 1,
  viewMode: "grid",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePanel: (activePanel) => set({ activePanel }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
