export const SUPPORTED_FORMATS = new Set([
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "tif",
  "webp",
  "avif",
  "heic",
  "heif",
  // RAW formats
  "dng",
  "cr2",
  "cr3",
  "nef",
  "nrw",
  "arw",
  "srf",
  "sr2",
  "orf",
  "rw2",
  "pef",
  "raf",
  "raw",
] as const);

export type SupportedFormat = typeof SUPPORTED_FORMATS extends Set<infer T> ? T : never;

export function isSupportedImageFormat(ext: string): boolean {
  return SUPPORTED_FORMATS.has(ext.toLowerCase().replace(".", "") as SupportedFormat);
}
