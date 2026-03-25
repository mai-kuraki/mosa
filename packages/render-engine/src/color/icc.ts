/**
 * ICC profile handling utilities.
 * MVP: Read embedded ICC profiles, embed sRGB/AdobeRGB on export.
 */

import sharp from "sharp";

export interface IccProfileInfo {
  name?: string;
  colorSpace?: string;
}

/**
 * Read the ICC profile info from an image file.
 */
export async function getIccProfile(filePath: string): Promise<IccProfileInfo> {
  const metadata = await sharp(filePath).metadata();
  return {
    name: metadata.icc ? "embedded" : undefined,
    colorSpace: metadata.space,
  };
}

/**
 * Embed an sRGB ICC profile into a buffer during encode.
 * Sharp handles this automatically when using .withMetadata({ icc: 'srgb' }).
 */
export async function embedSrgbProfile(
  buffer: Buffer,
  width: number,
  height: number,
  format: "jpeg" | "png" | "tiff",
  quality = 90,
): Promise<Buffer> {
  let pipeline = sharp(buffer, { raw: { width, height, channels: 3 } }).withMetadata({
    icc: "srgb",
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
