import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createLogger } from "./logger.service";

const execFileAsync = promisify(execFile);
const logger = createLogger("raw-decoder");

/** Known RAW/DNG extensions that sharp/libvips cannot reliably decode. */
const RAW_EXTENSIONS = new Set([
  "dng", "cr2", "cr3", "nef", "nrw", "arw", "srf", "sr2",
  "orf", "rw2", "pef", "raf", "raw", "rwl", "srw", "x3f",
  "3fr", "fff", "iiq", "mos", "mrw", "erf", "mef", "kdc", "dcr",
]);

export function isRawFormat(filePath: string): boolean {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return RAW_EXTENSIONS.has(ext);
}

export interface RawDecodeResult {
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
}

/**
 * Try to load LibRaw native addon. Returns null if unavailable
 * (e.g. libraw dylib not installed on user's machine).
 */
let _librawModule: typeof import("lightdrift-libraw") | null | undefined;
function getLibRaw(): typeof import("lightdrift-libraw") | null {
  if (_librawModule === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _librawModule = require("lightdrift-libraw");
      logger.info("LibRaw native addon loaded successfully");
    } catch {
      _librawModule = null;
      logger.warn("LibRaw native addon unavailable, will use sips fallback");
    }
  }
  return _librawModule;
}

/**
 * Decode a RAW file thumbnail.
 * Strategy: LibRaw (native) → sips (macOS built-in) fallback.
 */
export async function decodeRawThumbnail(filePath: string, maxSize = 512): Promise<RawDecodeResult> {
  const LibRaw = getLibRaw();
  if (LibRaw) {
    try {
      return await decodeWithLibRaw(LibRaw, filePath, maxSize);
    } catch (e) {
      logger.warn(`LibRaw failed for ${filePath}, falling back to sips: ${e}`);
    }
  }

  if (process.platform === "darwin") {
    return await decodeWithSips(filePath, maxSize);
  }

  throw new Error(`No RAW decoder available for ${filePath} on ${process.platform}`);
}

// ── LibRaw backend ──────────────────────────────────────────────

async function decodeWithLibRaw(
  LibRawModule: typeof import("lightdrift-libraw"),
  filePath: string,
  maxSize: number,
): Promise<RawDecodeResult> {
  const raw = new LibRawModule.default();
  try {
    await raw.loadFile(filePath);

    const metadata = await raw.getMetadata();
    const width = metadata.width || metadata.rawWidth || 0;
    const height = metadata.height || metadata.rawHeight || 0;

    // Process actual RAW data (not embedded thumbnail) for correct aspect ratio
    await raw.processImage();
    const result = await raw.createJPEGBuffer({ quality: 80, width: maxSize });
    if (!result.success || !result.buffer) {
      throw new Error("LibRaw failed to create JPEG buffer");
    }

    logger.info(`RAW decoded via LibRaw: ${width}x${height} — ${filePath}`);
    return { thumbnailBuffer: result.buffer, width, height };
  } finally {
    await raw.close().catch(() => {});
  }
}

// ── sips fallback (macOS only) ──────────────────────────────────

async function decodeWithSips(filePath: string, maxSize: number): Promise<RawDecodeResult> {
  const { width, height } = await getSipsDimensions(filePath);
  const tmpFile = join(tmpdir(), `mosa-raw-${randomUUID()}.jpg`);
  try {
    await execFileAsync("/usr/bin/sips", [
      "-s", "format", "jpeg",
      "-s", "formatOptions", "80",
      "--resampleHeightWidthMax", String(maxSize),
      filePath,
      "--out", tmpFile,
    ]);
    const thumbnailBuffer = await readFile(tmpFile);
    logger.info(`RAW decoded via sips: ${width}x${height} — ${filePath}`);
    return { thumbnailBuffer, width, height };
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

async function getSipsDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync("/usr/bin/sips", [
    "-g", "pixelWidth", "-g", "pixelHeight", filePath,
  ]);
  const wm = stdout.match(/pixelWidth:\s*(\d+)/);
  const hm = stdout.match(/pixelHeight:\s*(\d+)/);
  const width = wm ? parseInt(wm[1], 10) : 0;
  const height = hm ? parseInt(hm[1], 10) : 0;
  if (!width || !height) {
    throw new Error(`sips failed to read dimensions: ${filePath}`);
  }
  return { width, height };
}
