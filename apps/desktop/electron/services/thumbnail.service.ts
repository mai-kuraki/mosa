import sharp from "sharp";
import { app } from "electron";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
import { getFileHash } from "@mosa/shared-utils";
import { createLogger } from "./logger.service";

const logger = createLogger("thumbnail");

/**
 * Generate a 512px thumbnail for an image and save to cache directory.
 * Accepts a file path or a Buffer (e.g. embedded EXIF preview from RAW files).
 * Returns the path to the generated thumbnail.
 */
export async function generateThumbnail(input: string | Buffer, imageHash?: string): Promise<string> {
  const hash = imageHash ?? (typeof input === "string" ? await getFileHash(input) : "buf-" + Date.now());
  const bucket = hash.slice(0, 2);

  const cacheDir = join(app.getPath("userData"), "thumbnails", bucket);
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  const thumbnailPath = join(cacheDir, `${hash}.jpg`);

  // Skip if already exists
  if (existsSync(thumbnailPath)) {
    return thumbnailPath;
  }

  logger.debug(`Generating thumbnail for ${typeof input === "string" ? input : "buffer"}`);

  const buffer = await sharp(input)
    .rotate() // auto-rotate based on EXIF orientation
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  await writeFile(thumbnailPath, buffer);
  logger.info(`Thumbnail saved: ${thumbnailPath}`);

  return thumbnailPath;
}

/**
 * Generate a larger preview (1920px) for the editor view.
 */
export async function generatePreview(imagePath: string, maxSize = 1920): Promise<Buffer> {
  return sharp(imagePath)
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}
