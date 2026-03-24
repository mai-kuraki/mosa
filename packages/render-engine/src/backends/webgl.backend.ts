import type { RenderBackend } from "./backend.interface";

/**
 * WebGL 2.0 rendering backend stub for Phase 2.
 * Will use GLSL shaders for GPU-accelerated image processing.
 */
export class WebGLBackend implements RenderBackend {
  readonly name = "webgl";

  async decode(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async applyColorMatrix(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async applyLut3D(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async applyToneCurve(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async composite(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async encode(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }

  async resize(): Promise<never> {
    throw new Error("WebGL backend not implemented yet (Phase 2)");
  }
}
