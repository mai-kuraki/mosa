import { ipcMain } from "electron";
import { createLogger } from "../services/logger.service";
import {
  handleImageApplyPreset,
  handleImageGetMetadata,
  handleImageGetPreview,
} from "./handlers/image.handler";
import {
  handleCatalogImportFolder,
  handleCatalogImportFiles,
  handleCatalogGetImages,
  handleCatalogGetFolders,
  handleCatalogRemoveImage,
} from "./handlers/catalog.handler";
import { handleBatchStart, handleBatchCancel } from "./handlers/batch.handler";
import { handleExportSingle } from "./handlers/export.handler";
import { handleSettingsGet, handleSettingsSet } from "./handlers/settings.handler";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";

const logger = createLogger("ipc");

/**
 * Register all IPC handlers. Called once during app startup.
 */
export function registerIpcHandlers(): void {
  logger.info("Registering IPC handlers...");

  // Image processing
  ipcMain.handle(IPC_CHANNELS.IMAGE_APPLY_PRESET, (_e, data) => handleImageApplyPreset(data));
  ipcMain.handle(IPC_CHANNELS.IMAGE_GET_METADATA, (_e, data) => handleImageGetMetadata(data));
  ipcMain.handle(IPC_CHANNELS.IMAGE_GET_PREVIEW, (_e, data) => handleImageGetPreview(data));

  // Catalog management
  ipcMain.handle(IPC_CHANNELS.CATALOG_IMPORT_FOLDER, (_e, data) => handleCatalogImportFolder(data));
  ipcMain.handle(IPC_CHANNELS.CATALOG_IMPORT_FILES, (_e, data) => handleCatalogImportFiles(data));
  ipcMain.handle(IPC_CHANNELS.CATALOG_GET_IMAGES, (_e, data) => handleCatalogGetImages(data));
  ipcMain.handle(IPC_CHANNELS.CATALOG_GET_FOLDERS, () => handleCatalogGetFolders());
  ipcMain.handle(IPC_CHANNELS.CATALOG_REMOVE_IMAGE, (_e, data) => handleCatalogRemoveImage(data));

  // Batch processing
  ipcMain.handle(IPC_CHANNELS.BATCH_START, (_e, data) => handleBatchStart(data));
  ipcMain.handle(IPC_CHANNELS.BATCH_CANCEL, (_e, data) => handleBatchCancel(data));

  // Export
  ipcMain.handle(IPC_CHANNELS.EXPORT_SINGLE, (_e, data) => handleExportSingle(data));

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => handleSettingsGet());
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_e, data) => handleSettingsSet(data));

  logger.info("IPC handlers registered.");
}
