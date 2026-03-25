import type { RenderStage, StageContext } from "./stage";
import type { PipelineConfig, PipelineResult } from "./pipeline.types";
import { ok, err, type Result } from "@mosa/shared-utils";

/**
 * Orchestrates a chain of RenderStages to process an image.
 * Each stage receives the output of the previous stage.
 */
export class RenderPipeline {
  private stages: RenderStage[] = [];

  addStage(stage: RenderStage): this {
    this.stages.push(stage);
    return this;
  }

  clearStages(): this {
    this.stages = [];
    return this;
  }

  getStages(): readonly RenderStage[] {
    return this.stages;
  }

  /**
   * Execute all stages sequentially on the input buffer.
   */
  async execute(
    inputBuffer: Buffer,
    config: PipelineConfig,
  ): Promise<Result<PipelineResult, string>> {
    let currentBuffer = inputBuffer;

    const context: StageContext = {
      width: config.width,
      height: config.height,
      channels: config.channels ?? 3,
      metadata: config.metadata ?? {},
    };

    for (const stage of this.stages) {
      if (!stage.enabled) continue;

      try {
        currentBuffer = await stage.execute(currentBuffer, context);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return err(`Stage "${stage.name}" failed: ${message}`);
      }
    }

    return ok({
      buffer: currentBuffer,
      width: context.width,
      height: context.height,
    });
  }
}
