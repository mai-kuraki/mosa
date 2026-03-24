import sharp from "sharp";
import type { RenderStage, StageContext } from "../pipeline/stage";

/**
 * Composites a watermark image onto the processed photo.
 * Supports PNG watermarks with alpha transparency.
 */
export class WatermarkStage implements RenderStage {
  readonly name = "watermark";
  enabled = true;

  constructor(
    private watermarkPath: string,
    private position: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center" = "bottom-right",
    private opacity: number = 0.8,
    private scale: number = 0.15
  ) {}

  async execute(input: Buffer, context: StageContext): Promise<Buffer> {
    const { width, height } = context;

    // Resize watermark to a fraction of the image width
    const targetWatermarkWidth = Math.round(width * this.scale);
    const watermark = await sharp(this.watermarkPath)
      .resize(targetWatermarkWidth)
      .ensureAlpha(this.opacity)
      .toBuffer();

    const watermarkMeta = await sharp(watermark).metadata();
    const ww = watermarkMeta.width ?? targetWatermarkWidth;
    const wh = watermarkMeta.height ?? targetWatermarkWidth;

    const margin = Math.round(width * 0.02);
    const { left, top } = this.calculatePosition(width, height, ww, wh, margin);

    const result = await sharp(input, {
      raw: { width, height, channels: 3 },
    })
      .composite([
        {
          input: watermark,
          left,
          top,
        },
      ])
      .raw()
      .toBuffer();

    return result;
  }

  private calculatePosition(
    imgW: number,
    imgH: number,
    wmW: number,
    wmH: number,
    margin: number
  ): { left: number; top: number } {
    switch (this.position) {
      case "bottom-right":
        return { left: imgW - wmW - margin, top: imgH - wmH - margin };
      case "bottom-left":
        return { left: margin, top: imgH - wmH - margin };
      case "top-right":
        return { left: imgW - wmW - margin, top: margin };
      case "top-left":
        return { left: margin, top: margin };
      case "center":
        return {
          left: Math.round((imgW - wmW) / 2),
          top: Math.round((imgH - wmH) / 2),
        };
    }
  }
}
