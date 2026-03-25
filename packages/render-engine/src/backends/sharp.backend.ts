import sharp from "sharp";
import type { RenderBackend } from "./backend.interface";

type Matrix3x3 = [[number, number, number], [number, number, number], [number, number, number]];

/**
 * Sharp-based (libvips) rendering backend for Phase 1.
 * All image operations are performed on the CPU via Sharp's native bindings.
 */
export class SharpBackend implements RenderBackend {
  readonly name = "sharp";

  async decode(filePath: string) {
    const image = sharp(filePath);
    const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      width: info.width,
      height: info.height,
      channels: 3 as const,
    };
  }

  async applyColorMatrix(
    buffer: Buffer,
    width: number,
    height: number,
    matrix: number[][],
  ): Promise<Buffer> {
    const m: Matrix3x3 = [
      [matrix[0][0], matrix[0][1], matrix[0][2]],
      [matrix[1][0], matrix[1][1], matrix[1][2]],
      [matrix[2][0], matrix[2][1], matrix[2][2]],
    ];

    const result = await sharp(buffer, {
      raw: { width, height, channels: 3 },
    })
      .recomb(m)
      .raw()
      .toBuffer();

    return result;
  }

  async applyLut3D(
    buffer: Buffer,
    width: number,
    height: number,
    lutData: Float32Array,
    lutSize: number,
  ): Promise<Buffer> {
    const pixelCount = width * height;
    const output = Buffer.alloc(pixelCount * 3);
    const maxIndex = lutSize - 1;

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 3;
      const r = buffer[offset] / 255;
      const g = buffer[offset + 1] / 255;
      const b = buffer[offset + 2] / 255;

      const rIdx = r * maxIndex;
      const gIdx = g * maxIndex;
      const bIdx = b * maxIndex;

      const r0 = Math.floor(rIdx);
      const g0 = Math.floor(gIdx);
      const b0 = Math.floor(bIdx);
      const r1 = Math.min(r0 + 1, maxIndex);
      const g1 = Math.min(g0 + 1, maxIndex);
      const b1 = Math.min(b0 + 1, maxIndex);

      const rFrac = rIdx - r0;
      const gFrac = gIdx - g0;
      const bFrac = bIdx - b0;

      const lutIndex = (ri: number, gi: number, bi: number) =>
        (ri * lutSize * lutSize + gi * lutSize + bi) * 3;

      const c000 = lutIndex(r0, g0, b0);
      const c001 = lutIndex(r0, g0, b1);
      const c010 = lutIndex(r0, g1, b0);
      const c011 = lutIndex(r0, g1, b1);
      const c100 = lutIndex(r1, g0, b0);
      const c101 = lutIndex(r1, g0, b1);
      const c110 = lutIndex(r1, g1, b0);
      const c111 = lutIndex(r1, g1, b1);

      for (let ch = 0; ch < 3; ch++) {
        const c00 = lutData[c000 + ch] * (1 - bFrac) + lutData[c001 + ch] * bFrac;
        const c01 = lutData[c010 + ch] * (1 - bFrac) + lutData[c011 + ch] * bFrac;
        const c10 = lutData[c100 + ch] * (1 - bFrac) + lutData[c101 + ch] * bFrac;
        const c11 = lutData[c110 + ch] * (1 - bFrac) + lutData[c111 + ch] * bFrac;

        const c0 = c00 * (1 - gFrac) + c01 * gFrac;
        const c1 = c10 * (1 - gFrac) + c11 * gFrac;

        const value = c0 * (1 - rFrac) + c1 * rFrac;
        output[offset + ch] = Math.round(Math.max(0, Math.min(255, value * 255)));
      }
    }

    return output;
  }

  async applyToneCurve(
    buffer: Buffer,
    width: number,
    height: number,
    curve: { r: Uint8Array; g: Uint8Array; b: Uint8Array },
  ): Promise<Buffer> {
    const pixelCount = width * height;
    const output = Buffer.alloc(pixelCount * 3);

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 3;
      output[offset] = curve.r[buffer[offset]];
      output[offset + 1] = curve.g[buffer[offset + 1]];
      output[offset + 2] = curve.b[buffer[offset + 2]];
    }

    return output;
  }

  async composite(
    base: Buffer,
    overlay: Buffer,
    width: number,
    height: number,
    _opacity: number,
  ): Promise<Buffer> {
    // Note: Sharp composite doesn't directly support opacity on raw buffers.
    // For MVP, we apply opacity by pre-multiplying the overlay alpha.
    const result = await sharp(base, {
      raw: { width, height, channels: 3 },
    })
      .composite([
        {
          input: overlay,
          raw: { width, height, channels: 3 },
          blend: "over" as const,
        },
      ])
      .raw()
      .toBuffer();

    return result;
  }

  async encode(
    buffer: Buffer,
    width: number,
    height: number,
    format: "jpeg" | "png" | "tiff",
    quality = 90,
  ): Promise<Buffer> {
    let pipeline = sharp(buffer, {
      raw: { width, height, channels: 3 },
    });

    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality });
        break;
      case "png":
        pipeline = pipeline.png();
        break;
      case "tiff":
        pipeline = pipeline.tiff({ quality });
        break;
    }

    return pipeline.toBuffer();
  }

  async resize(
    buffer: Buffer,
    width: number,
    height: number,
    targetWidth: number,
    targetHeight: number,
  ): Promise<Buffer> {
    return sharp(buffer, {
      raw: { width, height, channels: 3 },
    })
      .resize(targetWidth, targetHeight, { fit: "inside" })
      .raw()
      .toBuffer();
  }
}
