/**
 * Abstract rendering backend interface.
 * Phase 1: Implemented by SharpBackend (CPU-based via libvips).
 * Phase 2: Will be implemented by WebGLBackend (GPU-based).
 */
export interface RenderBackend {
  readonly name: string;

  /** Decode an image file into a raw pixel buffer (RGB/RGBA). */
  decode(filePath: string): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
    channels: 3 | 4;
  }>;

  /** Apply a 3x3 color matrix transformation. */
  applyColorMatrix(
    buffer: Buffer,
    width: number,
    height: number,
    matrix: number[][],
  ): Promise<Buffer>;

  /** Apply a 3D LUT to the image buffer. */
  applyLut3D(
    buffer: Buffer,
    width: number,
    height: number,
    lutData: Float32Array,
    lutSize: number,
  ): Promise<Buffer>;

  /** Apply a 1D tone curve (256-entry lookup per channel). */
  applyToneCurve(
    buffer: Buffer,
    width: number,
    height: number,
    curve: { r: Uint8Array; g: Uint8Array; b: Uint8Array },
  ): Promise<Buffer>;

  /** Composite an overlay layer onto the base image. */
  composite(
    base: Buffer,
    overlay: Buffer,
    width: number,
    height: number,
    opacity: number,
  ): Promise<Buffer>;

  /** Encode a raw pixel buffer to a specific output format. */
  encode(
    buffer: Buffer,
    width: number,
    height: number,
    format: "jpeg" | "png" | "tiff",
    quality?: number,
  ): Promise<Buffer>;

  /** Resize an image buffer. */
  resize(
    buffer: Buffer,
    width: number,
    height: number,
    targetWidth: number,
    targetHeight: number,
  ): Promise<Buffer>;
}
