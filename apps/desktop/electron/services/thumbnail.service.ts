import sharp from "sharp";
import { app } from "electron";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
import { getFileHash } from "@mosa/shared-utils";
import { createLogger } from "./logger.service";

const logger = createLogger("thumbnail");

/**
 * Generate a 256px thumbnail for an image and save to cache directory.
 * Returns the path to the generated thumbnail.
 */
export async function generateThumbnail(imagePath: string, imageHash?: string): Promise<string> {
  const hash = imageHash ?? (await getFileHash(imagePath));
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

  logger.debug(`Generating thumbnail for ${imagePath}`);

  const buffer = await sharp(imagePath)
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
