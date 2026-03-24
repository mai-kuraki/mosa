import type { Preset } from "./preset.types";

/**
 * Leica M9 preset — Simulates the Kodak KAF-18500 CCD sensor look.
 *
 * Characteristics:
 * - Warm color temperature with slightly golden highlights
 * - Rich, saturated reds (the "Leica red")
 * - Blue-shifted shadows with slightly lifted blacks
 * - Moderate film-like contrast with a gentle S-curve
 * - Subtle vignetting typical of M-mount lenses
 */
export const LEICA_M9_PRESET: Preset = {
  id: "leica-m9",
  name: "Leica M9",
  description: "Classic CCD look — warm tones, rich reds, filmic shadows",

  // Color matrix that shifts toward warm tones with enhanced reds
  // Slightly desaturates blues while boosting red channel warmth
  colorMatrix: [
    [1.15, 0.05, -0.02],
    [-0.02, 1.02, 0.03],
    [-0.05, -0.08, 1.08],
  ],

  lutPath: "leica-m9/base.cube",

  grainIntensity: 0.08,
  vignetteStrength: 0.25,
  saturationAdjust: 0.1,
  contrastAdjust: 0.12,
};
