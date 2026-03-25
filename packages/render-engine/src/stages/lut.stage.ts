import type { RenderStage, StageContext } from "../pipeline/stage";
import type { RenderBackend } from "../backends/backend.interface";
import type { LutData } from "../lut/cube-parser";

/**
 * Applies a 3D LUT color transformation.
 * Core of camera style simulation — maps input colors to the target look.
 */
export class LutStage implements RenderStage {
  readonly name = "3d-lut";
  enabled = true;

  constructor(
    private backend: RenderBackend,
    private lutData: LutData,
  ) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    return this.backend.applyLut3D(
      input,
      context.width,
      context.height,
      this.lutData.data,
      this.lutData.size,
    );
  }
}
