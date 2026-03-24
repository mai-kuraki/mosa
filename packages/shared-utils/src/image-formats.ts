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
] as const);

export type SupportedFormat = typeof SUPPORTED_FORMATS extends Set<infer T> ? T : never;

export function isSupportedImageFormat(ext: string): boolean {
  return SUPPORTED_FORMATS.has(ext.toLowerCase().replace(".", "") as SupportedFormat);
}
