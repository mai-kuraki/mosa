/**
 * Color space conversion utilities.
 * MVP: All processing in sRGB. Phase 2 will add ProPhoto RGB support.
 */

/** Linear sRGB ↔ sRGB gamma transfer functions */
export function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(value: number): number {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

/** Convert a full buffer from sRGB to linear RGB */
export function bufferSrgbToLinear(buffer: Buffer): Float32Array {
  const result = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = srgbToLinear(buffer[i] / 255);
  }
  return result;
}

/** Convert a full buffer from linear RGB back to sRGB (8-bit) */
export function bufferLinearToSrgb(linear: Float32Array): Buffer {
  const result = Buffer.alloc(linear.length);
  for (let i = 0; i < linear.length; i++) {
    result[i] = Math.round(Math.max(0, Math.min(255, linearToSrgb(linear[i]) * 255)));
  }
  return result;
}
