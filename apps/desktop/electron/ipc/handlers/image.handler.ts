import { ok, err, type Result } from "@mosa/shared-utils";
import type {
  ApplyPresetRequest,
  ApplyPresetResponse,
  ImageMetadata,
} from "@mosa/ipc-bridge/src/contracts/image.contract";
import { createLogger } from "../../services/logger.service";

const logger = createLogger("ipc:image");

export async function handleImageApplyPreset(
  data: ApplyPresetRequest
): Promise<Result<ApplyPresetResponse, string>> {
  try {
    logger.info(`Applying preset "${data.presetId}" to ${data.imagePath}`);
    // TODO: Implement via Worker Thread + render pipeline
    return ok({
      previewDataUrl: "",
      histogram: [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to apply preset: ${message}`);
    return err(message);
  }
}

export async function handleImageGetMetadata(
  data: { imagePath: string }
): Promise<Result<ImageMetadata, string>> {
  try {
    logger.info(`Reading metadata for ${data.imagePath}`);
    // TODO: Implement with ExifReader
    return ok({
      width: 0,
      height: 0,
      format: "unknown",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}

export async function handleImageGetPreview(
  data: { imagePath: string; maxSize?: number }
): Promise<Result<{ dataUrl: string }, string>> {
  try {
    logger.info(`Generating preview for ${data.imagePath}`);
    // TODO: Implement with Sharp resize + base64 encode
    return ok({ dataUrl: "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}
