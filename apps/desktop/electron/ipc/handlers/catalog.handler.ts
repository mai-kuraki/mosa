import { ok, err, type Result } from "@mosa/shared-utils";
import type { FolderInfo, CatalogImage } from "@mosa/ipc-bridge/src/contracts/catalog.contract";
import { createLogger } from "../../services/logger.service";

const logger = createLogger("ipc:catalog");

export async function handleCatalogImportFolder(
  data: { folderPath: string }
): Promise<Result<{ folder: FolderInfo; importedCount: number }, string>> {
  try {
    logger.info(`Importing folder: ${data.folderPath}`);
    // TODO: Scan folder, insert into SQLite, generate thumbnails
    return ok({
      folder: {
        id: "",
        path: data.folderPath,
        name: data.folderPath.split("/").pop() ?? "",
        imageCount: 0,
        lastScanned: new Date().toISOString(),
      },
      importedCount: 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to import folder: ${message}`);
    return err(message);
  }
}

export async function handleCatalogGetImages(
  data: { folderId?: string; sortBy?: string; filterRating?: number }
): Promise<Result<{ images: CatalogImage[] }, string>> {
  try {
    // TODO: Query SQLite with filters
    return ok({ images: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}

export async function handleCatalogGetFolders(): Promise<
  Result<{ folders: FolderInfo[] }, string>
> {
  try {
    // TODO: Query SQLite for all folders
    return ok({ folders: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}
