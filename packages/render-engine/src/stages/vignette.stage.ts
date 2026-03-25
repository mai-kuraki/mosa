import type { RenderStage, StageContext } from "../pipeline/stage";

/**
 * Applies a radial vignette (darkening toward edges).
 * Simulates the optical vignetting of vintage M-mount lenses.
 */
export class VignetteStage implements RenderStage {
  readonly name = "vignette";
  enabled = true;

  constructor(private strength: number = 0.3) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    if (this.strength <= 0) return input;

    const { width, height, channels } = context;
    const output = Buffer.from(input);
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

        // Smooth falloff using squared distance
        const factor = 1 - this.strength * dist * dist;
        const offset = (y * width + x) * channels;

        for (let c = 0; c < channels; c++) {
          output[offset + c] = Math.round(Math.max(0, output[offset + c] * factor));
        }
      }
    }

    return output;
  }
}
