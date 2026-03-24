import type { IpcContract } from "../channels";

export interface FolderInfo {
  id: string;
  path: string;
  name: string;
  imageCount: number;
  lastScanned: string;
}

export interface CatalogImage {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  format: string;
  dateTaken?: string;
  cameraMake?: string;
  cameraModel?: string;
  rating: number;
  thumbnailPath?: string;
  createdAt: string;
}

export interface CatalogContract {
  "catalog:import-folder": IpcContract<
    { folderPath: string },
    { folder: FolderInfo; importedCount: number }
  >;
  "catalog:get-images": IpcContract<
    { folderId?: string; sortBy?: string; filterRating?: number },
    { images: CatalogImage[] }
  >;
  "catalog:get-folders": IpcContract<void, { folders: FolderInfo[] }>;
  "catalog:remove-image": IpcContract<{ imageId: string }, void>;
  "catalog:set-rating": IpcContract<
    { imageId: string; rating: number },
    void
  >;
}
