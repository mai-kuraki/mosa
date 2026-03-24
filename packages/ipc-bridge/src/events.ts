/** Events emitted from Main process to Renderer (one-way push) */
export interface IpcEvents {
  /** Batch processing progress update */
  "batch:progress": {
    batchId: string;
    imageId: string;
    status: "processing" | "completed" | "failed";
    progress: number;
    error?: string;
  };

  /** File watcher detected external changes */
  "catalog:file-changed": {
    imageId: string;
    filePath: string;
    changeType: "modified" | "deleted";
  };

  /** Thumbnail generation completed */
  "catalog:thumbnail-ready": {
    imageId: string;
    thumbnailPath: string;
  };

  /** Import progress */
  "catalog:import-progress": {
    folderPath: string;
    processed: number;
    total: number;
  };

  /** Window maximized state changed */
  "window:maximized-change": boolean;
}
