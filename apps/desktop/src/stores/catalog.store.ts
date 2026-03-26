import { create } from "zustand";
import type { CatalogImage, FolderInfo } from "@mosa/ipc-bridge/src/contracts/catalog.contract";

interface CatalogState {
  folders: FolderInfo[];
  images: CatalogImage[];
  selectedIds: Set<string>;
  sortBy: "date" | "name" | "rating";
  filterRating: number;
  isImporting: boolean;
  importProgress: { processed: number; total: number } | null;

  setFolders: (folders: FolderInfo[]) => void;
  setImages: (images: CatalogImage[]) => void;
  addFolder: (folder: FolderInfo) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSortBy: (sort: "date" | "name" | "rating") => void;
  setFilterRating: (rating: number) => void;
  setImporting: (importing: boolean) => void;
  setImportProgress: (progress: { processed: number; total: number } | null) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  folders: [],
  images: [],
  selectedIds: new Set(),
  sortBy: "date",
  filterRating: 0,
  isImporting: false,
  importProgress: null,

  setFolders: (folders) => set({ folders }),
  setImages: (images) => set({ images }),
  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders.filter((f) => f.id !== folder.id), folder],
    })),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.images.map((img) => img.id)),
    })),

  clearSelection: () => set({ selectedIds: new Set() }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterRating: (filterRating) => set({ filterRating }),
  setImporting: (isImporting) => set({ isImporting }),
  setImportProgress: (importProgress) => set({ importProgress }),
}));
