export interface PipelineConfig {
  width: number;
  height: number;
  channels?: 3 | 4;
  metadata?: Record<string, unknown>;
}

export interface PipelineResult {
  buffer: Buffer;
  width: number;
  height: number;
}
