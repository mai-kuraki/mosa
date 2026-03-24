import { ok, err, type Result } from "@mosa/shared-utils";
import type { BatchSettings } from "@mosa/ipc-bridge/src/contracts/batch.contract";
import { createLogger } from "../../services/logger.service";

const logger = createLogger("ipc:batch");

export async function handleBatchStart(
  data: { imageIds: string[]; settings: BatchSettings }
): Promise<Result<{ batchId: string }, string>> {
  try {
    logger.info(`Starting batch: ${data.imageIds.length} images with preset "${data.settings.presetId}"`);
    // TODO: Spawn batch worker, return batch ID
    const batchId = crypto.randomUUID();
    return ok({ batchId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start batch: ${message}`);
    return err(message);
  }
}

export async function handleBatchCancel(
  data: { batchId: string }
): Promise<Result<void, string>> {
  try {
    logger.info(`Cancelling batch: ${data.batchId}`);
    // TODO: Terminate batch worker
    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}
