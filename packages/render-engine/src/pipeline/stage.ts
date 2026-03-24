/**
 * Context passed through the pipeline to each stage.
 * Stages may read dimensions and metadata, but should not mutate them
 * unless they change the image dimensions (e.g., crop).
 */
export interface StageContext {
  width: number;
  height: number;
  channels: 3 | 4;
  metadata: Record<string, unknown>;
}

/**
 * A single processing stage in the render pipeline.
 * Implementations transform an image buffer and return the result.
 */
export interface RenderStage {
  /** Human-readable name for logging and error reporting */
  readonly name: string;

  /** Whether this stage is active. Disabled stages are skipped. */
  enabled: boolean;

  /** Process the input buffer and return the transformed buffer. */
  execute(input: Buffer, context: StageContext): Promise<Buffer>;
}
