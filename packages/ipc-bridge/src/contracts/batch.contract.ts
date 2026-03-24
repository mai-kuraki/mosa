import type { IpcContract } from "../channels";

export interface BatchItem {
  imageId: string;
  imagePath: string;
  presetId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

export interface BatchSettings {
  presetId: string;
  outputDir: string;
  outputFormat: "jpeg" | "png" | "tiff";
  quality: number;
  addWatermark: boolean;
}

export interface BatchContract {
  "batch:start": IpcContract<
    { imageIds: string[]; settings: BatchSettings },
    { batchId: string }
  >;
  "batch:cancel": IpcContract<{ batchId: string }, void>;
  "batch:get-status": IpcContract<
    { batchId: string },
    { items: BatchItem[]; completed: number; total: number }
  >;
}
