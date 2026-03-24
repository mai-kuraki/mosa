import type { RenderStage, StageContext } from "../pipeline/stage";
import type { RenderBackend } from "../backends/backend.interface";

/**
 * Applies a 1D tone curve per channel.
 * Simulates film S-curves: shadow lift, midtone contrast, highlight rolloff.
 */
export class ToneCurveStage implements RenderStage {
  readonly name = "tone-curve";
  enabled = true;

  private curve: { r: Uint8Array; g: Uint8Array; b: Uint8Array };

  /**
   * @param controlPoints Array of [input, output] pairs (0-255) for each channel.
   *        If a single array is given, it applies to all channels.
   */
  constructor(
    private backend: RenderBackend,
    rPoints: [number, number][],
    gPoints?: [number, number][],
    bPoints?: [number, number][]
  ) {
    this.curve = {
      r: ToneCurveStage.buildLookupTable(rPoints),
      g: ToneCurveStage.buildLookupTable(gPoints ?? rPoints),
      b: ToneCurveStage.buildLookupTable(bPoints ?? rPoints),
    };
  }

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    return this.backend.applyToneCurve(
      input,
      context.width,
      context.height,
      this.curve
    );
  }

  /**
   * Build a 256-entry lookup table from sparse control points
   * using monotonic cubic interpolation.
   */
  static buildLookupTable(points: [number, number][]): Uint8Array {
    const lut = new Uint8Array(256);
    const sorted = [...points].sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < 256; i++) {
      // Find surrounding control points
      let lower = sorted[0];
      let upper = sorted[sorted.length - 1];

      for (let j = 0; j < sorted.length - 1; j++) {
        if (i >= sorted[j][0] && i <= sorted[j + 1][0]) {
          lower = sorted[j];
          upper = sorted[j + 1];
          break;
        }
      }

      if (lower[0] === upper[0]) {
        lut[i] = Math.round(lower[1]);
      } else {
        // Linear interpolation between control points
        const t = (i - lower[0]) / (upper[0] - lower[0]);
        const value = lower[1] + t * (upper[1] - lower[1]);
        lut[i] = Math.round(Math.max(0, Math.min(255, value)));
      }
    }

    return lut;
  }
}
