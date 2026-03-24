export type PresetId = "leica-m9" | "leica-m3";

export interface ToneCurveConfig {
  r: number[];
  g: number[];
  b: number[];
}

export interface Preset {
  id: PresetId;
  name: string;
  description: string;

  /** 3x3 color transformation matrix */
  colorMatrix: number[][];

  /** Path to .cube LUT file (relative to vault) */
  lutPath?: string;

  /** Tone curve control points (0-255 input → 0-255 output) */
  toneCurve?: ToneCurveConfig;

  /** Film grain simulation intensity (0.0 - 1.0) */
  grainIntensity: number;

  /** Vignette strength (0.0 = none, 1.0 = max) */
  vignetteStrength: number;

  /** Saturation adjustment (-1.0 to 1.0, 0 = no change) */
  saturationAdjust: number;

  /** Contrast adjustment (-1.0 to 1.0, 0 = no change) */
  contrastAdjust: number;
}
