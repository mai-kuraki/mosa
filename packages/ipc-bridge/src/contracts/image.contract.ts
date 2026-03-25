import type { IpcContract } from "../channels";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  dateTaken?: string;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;
}

export interface ApplyPresetRequest {
  imagePath: string;
  presetId: string;
  outputQuality?: number;
}

export interface ApplyPresetResponse {
  previewDataUrl: string;
  histogram: number[];
}

export interface ImageContract {
  "image:apply-preset": IpcContract<ApplyPresetRequest, ApplyPresetResponse>;
  "image:get-metadata": IpcContract<{ imagePath: string }, ImageMetadata>;
  "image:get-preview": IpcContract<{ imagePath: string; maxSize?: number }, { dataUrl: string }>;
  "image:get-histogram": IpcContract<{ imagePath: string }, { histogram: number[] }>;
}
