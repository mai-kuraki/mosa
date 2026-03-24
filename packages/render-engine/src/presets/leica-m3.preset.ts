import type { Preset } from "./preset.types";

/**
 * Leica M3 preset — Simulates classic rangefinder film photography.
 *
 * Characteristics:
 * - Cool, slightly muted tones reminiscent of Kodachrome/Portra
 * - Gentle highlight rolloff with creamy transitions
 * - Lifted shadows with a slight blue-green tint
 * - Lower overall saturation for a timeless, documentary feel
 * - More pronounced vignetting from vintage M-mount lenses
 */
export const LEICA_M3_PRESET: Preset = {
  id: "leica-m3",
  name: "Leica M3",
  description: "Vintage film rangefinder — muted tones, classic Kodachrome feel",

  // Color matrix for a cooler, more muted palette
  // Shifts toward blue-green in shadows, reduces red saturation
  colorMatrix: [
    [1.02, 0.02, 0.0],
    [0.01, 1.05, -0.02],
    [0.0, 0.05, 1.1],
  ],

  lutPath: "leica-m3/base.cube",

  grainIntensity: 0.15,
  vignetteStrength: 0.35,
  saturationAdjust: -0.1,
  contrastAdjust: 0.08,
};
