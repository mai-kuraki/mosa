import type { RenderStage, StageContext } from "../pipeline/stage";
import type { RenderBackend } from "../backends/backend.interface";

/**
 * Applies a 3x3 color transformation matrix.
 * Used to simulate camera sensor color response (e.g., Leica CCD warmth).
 */
export class ColorMatrixStage implements RenderStage {
  readonly name = "color-matrix";
  enabled = true;

  constructor(
    private backend: RenderBackend,
    private matrix: number[][]
  ) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    return this.backend.applyColorMatrix(
      input,
      context.width,
      context.height,
      this.matrix
    );
  }
}
