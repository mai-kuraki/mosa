import type { RenderStage, StageContext } from "../pipeline/stage";

/**
 * Simulates film grain by adding gaussian noise to the image.
 * Intensity controls the noise amplitude.
 */
export class GrainStage implements RenderStage {
  readonly name = "grain";
  enabled = true;

  constructor(private intensity: number = 0.1) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    if (this.intensity <= 0) return input;

    const output = Buffer.from(input);
    const pixelCount = context.width * context.height * context.channels;
    const amplitude = this.intensity * 40; // Scale to visible range

    for (let i = 0; i < pixelCount; i++) {
      // Box-Muller transform for gaussian distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = output[i] + noise * amplitude;
      output[i] = Math.round(Math.max(0, Math.min(255, value)));
    }

    return output;
  }
}
