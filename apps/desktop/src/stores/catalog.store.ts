import { create } from "zustand";
import type { CatalogImage, FolderInfo } from "@mosa/ipc-bridge/src/contracts/catalog.contract";

interface CatalogState {
  folders: FolderInfo[];
  images: CatalogImage[];
  selectedIds: Set<string>;
  sortBy: "date" | "name" | "rating";
  filterRating: number;

  setFolders: (folders: FolderInfo[]) => void;
  setImages: (images: CatalogImage[]) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSortBy: (sort: "date" | "name" | "rating") => void;
  setFilterRating: (rating: number) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  folders: [],
  images: [],
  selectedIds: new Set(),
  sortBy: "date",
  filterRating: 0,

  setFolders: (folders) => set({ folders }),
  setImages: (images) => set({ images }),

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
}));
