import sharp from "sharp";
import type { RenderStage, StageContext } from "../pipeline/stage";

/**
 * Encodes raw pixel buffer to a specific output format (JPEG, PNG, TIFF).
 * Final stage in the pipeline.
 */
export class EncodeStage implements RenderStage {
  readonly name = "encode";
  enabled = true;

  constructor(
    private format: "jpeg" | "png" | "tiff" = "jpeg",
    private quality: number = 90,
  ) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    let pipeline = sharp(input, {
      raw: {
        width: context.width,
        height: context.height,
        channels: context.channels,
      },
    });

    switch (this.format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: this.quality });
        break;
      case "png":
        pipeline = pipeline.png();
        break;
      case "tiff":
        pipeline = pipeline.tiff({ quality: this.quality });
        break;
    }

    return pipeline.toBuffer();
  }
}
