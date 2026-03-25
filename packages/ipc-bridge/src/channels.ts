import type { Result } from "@mosa/shared-utils";

// ── Channel name constants ──

export const IPC_CHANNELS = {
  // Image processing
  IMAGE_APPLY_PRESET: "image:apply-preset",
  IMAGE_GET_METADATA: "image:get-metadata",
  IMAGE_GET_PREVIEW: "image:get-preview",
  IMAGE_GET_HISTOGRAM: "image:get-histogram",

  // Catalog management
  CATALOG_IMPORT_FOLDER: "catalog:import-folder",
  CATALOG_GET_IMAGES: "catalog:get-images",
  CATALOG_GET_FOLDERS: "catalog:get-folders",
  CATALOG_REMOVE_IMAGE: "catalog:remove-image",
  CATALOG_SET_RATING: "catalog:set-rating",

  // Batch processing
  BATCH_START: "batch:start",
  BATCH_CANCEL: "batch:cancel",
  BATCH_GET_STATUS: "batch:get-status",

  // Export
  EXPORT_SINGLE: "export:single",
  EXPORT_BATCH: "export:batch",

  // Settings
  SETTINGS_GET: "settings:get",
  SETTINGS_SET: "settings:set",
} as const;

// ── Type-level IPC contract infrastructure ──

/** Maps a channel name to its request and response types */
export type IpcContract<TReq, TRes> = {
  request: TReq;
  response: Result<TRes, string>;
};

/** Extract request type from a contract */
export type IpcRequest<T> = T extends IpcContract<infer R, unknown> ? R : never;

/** Extract response type from a contract */
export type IpcResponse<T> = T extends IpcContract<unknown, infer R>
  ? Result<R, string>
  : never;

/** Handler function signature for Main process */
export type IpcHandler<T> = T extends IpcContract<infer Req, infer Res>
  ? (request: Req) => Promise<Result<Res, string>>
  : never;

/** Invoker function signature for Renderer process */
export type IpcInvoker<T> = T extends IpcContract<infer Req, infer Res>
  ? (request: Req) => Promise<Result<Res, string>>
  : never;
