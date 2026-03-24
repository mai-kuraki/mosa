import type { IpcContract } from "../channels";

export interface ExportSettings {
  outputDir: string;
  format: "jpeg" | "png" | "tiff";
  quality: number;
  addWatermark: boolean;
  watermarkTemplatePath?: string;
  watermarkPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  watermarkOpacity?: number;
  watermarkScale?: number;
}

export interface ExportContract {
  "export:single": IpcContract<
    { imageId: string; presetId: string; settings: ExportSettings },
    { outputPath: string }
  >;
  "export:batch": IpcContract<
    { imageIds: string[]; presetId: string; settings: ExportSettings },
    { batchId: string }
  >;
}
