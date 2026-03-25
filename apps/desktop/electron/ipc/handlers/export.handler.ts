import { ok, err, type Result } from "@mosa/shared-utils";
import type { ExportSettings } from "@mosa/ipc-bridge/src/contracts/export.contract";
import { createLogger } from "../../services/logger.service";

const logger = createLogger("ipc:export");

export async function handleExportSingle(data: {
  imageId: string;
  presetId: string;
  settings: ExportSettings;
}): Promise<Result<{ outputPath: string }, string>> {
  try {
    logger.info(`Exporting image ${data.imageId} with preset "${data.presetId}"`);
    // TODO: Run pipeline + write to outputDir
    return ok({ outputPath: "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to export: ${message}`);
    return err(message);
  }
}
