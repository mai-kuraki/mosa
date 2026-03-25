import sharp from "sharp";
import type { RenderStage, StageContext } from "../pipeline/stage";

/**
 * Decodes an image file into raw RGB pixel buffer.
 * First stage in the pipeline — reads the source image.
 */
export class DecodeStage implements RenderStage {
  readonly name = "decode";
  enabled = true;

  constructor(private filePath: string) {}

  async execute(_input: Buffer, context: StageContext): Promise<Buffer> {
    const image = sharp(this.filePath);
    const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });

    // Update context with actual image dimensions
    context.width = info.width;
    context.height = info.height;
    context.channels = 3;

    return data;
  }
}
