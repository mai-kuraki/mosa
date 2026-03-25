// @mosa/ipc-bridge
// Type-safe IPC contracts shared between Main and Renderer processes

export { IPC_CHANNELS } from "./channels";
export type { IpcContract, IpcRequest, IpcResponse, IpcHandler, IpcInvoker } from "./channels";

export type { ImageContract } from "./contracts/image.contract";
export type { CatalogContract } from "./contracts/catalog.contract";
export type { BatchContract } from "./contracts/batch.contract";
export type { ExportContract } from "./contracts/export.contract";

export type { IpcEvents } from "./events";
