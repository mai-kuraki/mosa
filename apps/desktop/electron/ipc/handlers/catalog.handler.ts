import { randomUUID } from "node:crypto";
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { app, dialog } from "electron";
import sharp from "sharp";
import ExifReader from "exifreader";
import { ok, err, type Result, getFileHash, isSupportedImageFormat } from "@mosa/shared-utils";
import type { FolderInfo, CatalogImage } from "@mosa/ipc-bridge/src/contracts/catalog.contract";
import { getDatabase } from "../../services/database.service";
import { generateThumbnail } from "../../services/thumbnail.service";
import { createLogger } from "../../services/logger.service";
import { getMainWindow } from "../../main";

const logger = createLogger("ipc:catalog");

// ── Helpers ──

function sendToRenderer(channel: string, data: unknown): void {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data);
  }
}

async function readExif(filePath: string) {
  try {
    const tags = await ExifReader.load(filePath, { expanded: true });
    const exif = tags.exif ?? {};
    return {
      dateTaken: exif.DateTime?.description ?? exif.DateTimeOriginal?.description ?? undefined,
      cameraMake: exif.Make?.description ?? undefined,
      cameraModel: exif.Model?.description ?? undefined,
      lens: exif.LensModel?.description ?? undefined,
      iso: exif.ISOSpeedRatings?.value ? Number(exif.ISOSpeedRatings.value) : undefined,
      aperture: exif.FNumber?.value ? Number(exif.FNumber.value) : undefined,
      shutterSpeed: exif.ExposureTime?.description ?? undefined,
      focalLength: exif.FocalLength?.value ? Number(exif.FocalLength.value) : undefined,
    };
  } catch {
    logger.warn(`Failed to read EXIF for ${filePath}`);
    return {};
  }
}

async function processImage(
  filePath: string,
  folderId: string,
): Promise<CatalogImage | null> {
  try {
    const db = getDatabase();
    const fileName = basename(filePath);
    const stat = statSync(filePath);
    const fileHash = await getFileHash(filePath);

    // Dedup check
    const existing = db.prepare("SELECT id FROM images WHERE file_hash = ?").get(fileHash);
    if (existing) {
      logger.debug(`Skipping duplicate: ${fileName}`);
      return null;
    }

    // Image dimensions via Sharp
    const metadata = await sharp(filePath).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const format = metadata.format ?? extname(filePath).replace(".", "");

    // EXIF
    const exif = await readExif(filePath);

    // Thumbnail
    let thumbnailPath: string | null = null;
    try {
      thumbnailPath = await generateThumbnail(filePath, fileHash);
    } catch (thumbErr) {
      logger.error(`Thumbnail generation failed for ${filePath}: ${thumbErr}`);
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO images (
        id, file_path, file_hash, file_size, width, height, format,
        date_taken, camera_make, camera_model, lens, iso, aperture,
        shutter_speed, focal_length, rating, thumbnail_path, folder_id,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, 0, ?, ?,
        ?, ?
      )
    `).run(
      id, filePath, fileHash, stat.size, width, height, format,
      exif.dateTaken ?? null, exif.cameraMake ?? null, exif.cameraModel ?? null,
      exif.lens ?? null, exif.iso ?? null, exif.aperture ?? null,
      exif.shutterSpeed ?? null, exif.focalLength ?? null, thumbnailPath, folderId,
      now, now,
    );

    return {
      id,
      filePath,
      fileName,
      fileSize: stat.size,
      width,
      height,
      format,
      dateTaken: exif.dateTaken,
      cameraMake: exif.cameraMake,
      cameraModel: exif.cameraModel,
      iso: exif.iso,
      aperture: exif.aperture,
      shutterSpeed: exif.shutterSpeed,
      focalLength: exif.focalLength,
      rating: 0,
      thumbnailPath,
      folderId,
      createdAt: now,
    };
  } catch (error) {
    logger.error(`Failed to process ${filePath}: ${error}`);
    return null;
  }
}

// ── Handlers ──

export async function handleCatalogImportFolder(data?: {
  folderPath?: string;
}): Promise<Result<{ folder: FolderInfo; importedCount: number }, string>> {
  try {
    let folderPath = data?.folderPath;

    if (!folderPath) {
      const win = getMainWindow();
      const result = await dialog.showOpenDialog(win!, {
        properties: ["openDirectory"],
        title: "选择文件夹",
      });
      if (result.canceled || result.filePaths.length === 0) {
        return ok({ folder: { id: "", path: "", name: "", imageCount: 0, lastScanned: "" }, importedCount: 0 });
      }
      folderPath = result.filePaths[0];
    }

    if (!existsSync(folderPath)) {
      return err(`Folder not found: ${folderPath}`);
    }

    logger.info(`Importing folder: ${folderPath}`);
    const db = getDatabase();

    // Check if folder already exists
    const existingFolder = db.prepare("SELECT id FROM folders WHERE path = ?").get(folderPath) as
      | { id: string }
      | undefined;

    const folderId = existingFolder?.id ?? randomUUID();
    const folderName = basename(folderPath);
    const now = new Date().toISOString();

    if (!existingFolder) {
      db.prepare("INSERT INTO folders (id, path, name, image_count, last_scanned) VALUES (?, ?, ?, 0, ?)").run(
        folderId, folderPath, folderName, now,
      );
    }

    // Scan for image files (non-recursive for MVP)
    const entries = readdirSync(folderPath);
    const imageFiles = entries
      .filter((name) => {
        const ext = extname(name).slice(1);
        return ext && isSupportedImageFormat(ext);
      })
      .map((name) => join(folderPath!, name));

    let importedCount = 0;
    for (let i = 0; i < imageFiles.length; i++) {
      const result = await processImage(imageFiles[i], folderId);
      if (result) importedCount++;

      sendToRenderer("catalog:import-progress", {
        folderPath,
        processed: i + 1,
        total: imageFiles.length,
      });
    }

    // Update folder image count
    const countResult = db.prepare("SELECT COUNT(*) as count FROM images WHERE folder_id = ?").get(folderId) as {
      count: number;
    };
    db.prepare("UPDATE folders SET image_count = ?, last_scanned = ? WHERE id = ?").run(
      countResult.count, now, folderId,
    );

    const folder: FolderInfo = {
      id: folderId,
      path: folderPath,
      name: folderName,
      imageCount: countResult.count,
      lastScanned: now,
    };

    logger.info(`Imported ${importedCount} images from ${folderPath}`);
    return ok({ folder, importedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to import folder: ${message}`);
    return err(message);
  }
}

export async function handleCatalogImportFiles(data?: {
  filePaths?: string[];
}): Promise<Result<{ importedCount: number; folderId: string }, string>> {
  try {
    let filePaths = data?.filePaths;

    if (!filePaths || filePaths.length === 0) {
      const win = getMainWindow();
      const exts = ["jpg", "jpeg", "png", "tiff", "tif", "webp", "avif", "heic", "heif"];
      const result = await dialog.showOpenDialog(win!, {
        properties: ["openFile", "multiSelections"],
        title: "选择图片",
        filters: [{ name: "Images", extensions: exts }],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return ok({ importedCount: 0, folderId: "" });
      }
      filePaths = result.filePaths;
    }

    // Workspace directory: {userData}/workspace/imports/{YYYY-MM-DD}/
    const dateStr = new Date().toISOString().split("T")[0];
    const workspaceDir = join(app.getPath("userData"), "workspace", "imports", dateStr);
    if (!existsSync(workspaceDir)) {
      mkdirSync(workspaceDir, { recursive: true });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    // Create or get workspace folder record
    let folderRow = db.prepare("SELECT id FROM folders WHERE path = ?").get(workspaceDir) as
      | { id: string }
      | undefined;
    const folderId = folderRow?.id ?? randomUUID();

    if (!folderRow) {
      db.prepare("INSERT INTO folders (id, path, name, image_count, last_scanned) VALUES (?, ?, ?, 0, ?)").run(
        folderId, workspaceDir, `导入 ${dateStr}`, now,
      );
    }

    let importedCount = 0;
    for (let i = 0; i < filePaths.length; i++) {
      const srcPath = filePaths[i];
      const fileName = basename(srcPath);

      // Copy to workspace (handle name collision)
      let destPath = join(workspaceDir, fileName);
      let counter = 1;
      while (existsSync(destPath)) {
        const ext = extname(fileName);
        const nameNoExt = basename(fileName, ext);
        destPath = join(workspaceDir, `${nameNoExt}-${counter}${ext}`);
        counter++;
      }
      copyFileSync(srcPath, destPath);

      const result = await processImage(destPath, folderId);
      if (result) importedCount++;

      sendToRenderer("catalog:import-progress", {
        folderPath: workspaceDir,
        processed: i + 1,
        total: filePaths.length,
      });
    }

    // Update folder image count
    const countResult = db.prepare("SELECT COUNT(*) as count FROM images WHERE folder_id = ?").get(folderId) as {
      count: number;
    };
    db.prepare("UPDATE folders SET image_count = ?, last_scanned = ? WHERE id = ?").run(
      countResult.count, now, folderId,
    );

    logger.info(`Imported ${importedCount} files to workspace`);
    return ok({ importedCount, folderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to import files: ${message}`);
    return err(message);
  }
}

export async function handleCatalogGetImages(data: {
  folderId?: string;
  sortBy?: string;
  filterRating?: number;
}): Promise<Result<{ images: CatalogImage[] }, string>> {
  try {
    const db = getDatabase();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (data.folderId) {
      conditions.push("folder_id = ?");
      params.push(data.folderId);
    }
    if (data.filterRating && data.filterRating > 0) {
      conditions.push("rating >= ?");
      params.push(data.filterRating);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderBy = "created_at DESC";
    switch (data.sortBy) {
      case "date":
        orderBy = "date_taken DESC, created_at DESC";
        break;
      case "name":
        orderBy = "file_path ASC";
        break;
      case "rating":
        orderBy = "rating DESC, created_at DESC";
        break;
    }

    const rows = db.prepare(`SELECT * FROM images ${where} ORDER BY ${orderBy}`).all(...params) as Array<{
      id: string;
      file_path: string;
      file_hash: string;
      file_size: number;
      width: number;
      height: number;
      format: string;
      date_taken: string | null;
      camera_make: string | null;
      camera_model: string | null;
      iso: number | null;
      aperture: number | null;
      shutter_speed: string | null;
      focal_length: number | null;
      rating: number;
      thumbnail_path: string | null;
      folder_id: string | null;
      created_at: string;
    }>;

    const images: CatalogImage[] = rows.map((row) => ({
      id: row.id,
      filePath: row.file_path,
      fileName: basename(row.file_path),
      fileSize: row.file_size,
      width: row.width,
      height: row.height,
      format: row.format,
      dateTaken: row.date_taken ?? undefined,
      cameraMake: row.camera_make ?? undefined,
      cameraModel: row.camera_model ?? undefined,
      iso: row.iso ?? undefined,
      aperture: row.aperture ?? undefined,
      shutterSpeed: row.shutter_speed ?? undefined,
      focalLength: row.focal_length ?? undefined,
      rating: row.rating,
      thumbnailPath: row.thumbnail_path ?? undefined,
      folderId: row.folder_id ?? undefined,
      createdAt: row.created_at,
    }));

    // Regenerate missing thumbnails in the background
    for (const row of rows) {
      if (!row.thumbnail_path || !existsSync(row.thumbnail_path)) {
        generateThumbnail(row.file_path, row.file_hash)
          .then((newPath) => {
            db.prepare("UPDATE images SET thumbnail_path = ? WHERE id = ?").run(newPath, row.id);
          })
          .catch((e) => logger.error(`Thumbnail regen failed for ${row.id}: ${e}`));
      }
    }

    return ok({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}

export async function handleCatalogGetFolders(): Promise<Result<{ folders: FolderInfo[] }, string>> {
  try {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM folders ORDER BY last_scanned DESC").all() as Array<{
      id: string;
      path: string;
      name: string;
      image_count: number;
      last_scanned: string;
    }>;

    const folders: FolderInfo[] = rows.map((row) => ({
      id: row.id,
      path: row.path,
      name: row.name,
      imageCount: row.image_count,
      lastScanned: row.last_scanned,
    }));

    return ok({ folders });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}

export async function handleCatalogRemoveImage(data: {
  imageId: string;
}): Promise<Result<void, string>> {
  try {
    const db = getDatabase();
    const row = db.prepare("SELECT file_path, thumbnail_path, folder_id FROM images WHERE id = ?").get(data.imageId) as
      | { file_path: string; thumbnail_path: string | null; folder_id: string | null }
      | undefined;

    if (!row) {
      return err("Image not found");
    }

    // Delete thumbnail from disk
    if (row.thumbnail_path && existsSync(row.thumbnail_path)) {
      const { unlinkSync } = await import("node:fs");
      unlinkSync(row.thumbnail_path);
    }

    // If image is in mosa workspace, delete original file too
    const workspaceDir = join(app.getPath("userData"), "workspace");
    if (row.file_path.startsWith(workspaceDir) && existsSync(row.file_path)) {
      const { unlinkSync } = await import("node:fs");
      unlinkSync(row.file_path);
    }

    // Delete DB record
    db.prepare("DELETE FROM images WHERE id = ?").run(data.imageId);

    // Update folder image count, remove folder if empty
    if (row.folder_id) {
      const countResult = db.prepare("SELECT COUNT(*) as count FROM images WHERE folder_id = ?").get(row.folder_id) as {
        count: number;
      };
      if (countResult.count === 0) {
        db.prepare("DELETE FROM folders WHERE id = ?").run(row.folder_id);
        logger.info(`Removed empty folder: ${row.folder_id}`);
      } else {
        db.prepare("UPDATE folders SET image_count = ? WHERE id = ?").run(countResult.count, row.folder_id);
      }
    }

    logger.info(`Removed image: ${data.imageId}`);
    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to remove image: ${message}`);
    return err(message);
  }
}
