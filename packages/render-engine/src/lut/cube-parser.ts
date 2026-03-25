import { readFile } from "node:fs/promises";
import { ok, err, type Result } from "@mosa/shared-utils";

export interface LutData {
  size: number;
  title: string;
  data: Float32Array;
}

/**
 * Parses .cube LUT files (Adobe / Resolve standard format).
 * Supports 3D LUTs with TITLE, LUT_3D_SIZE, DOMAIN_MIN, DOMAIN_MAX directives.
 */
export class CubeParser {
  async parseFile(filePath: string): Promise<Result<LutData, string>> {
    try {
      const content = await readFile(filePath, "utf-8");
      return this.parse(content);
    } catch (error) {
      return err(`Failed to read LUT file: ${filePath}`);
    }
  }

  parse(content: string): Result<LutData, string> {
    const lines = content.split("\n");
    let title = "";
    let size = 0;
    const values: number[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue;

      if (line.startsWith("TITLE")) {
        title = line.replace(/^TITLE\s*"?/, "").replace(/"?\s*$/, "");
        continue;
      }

      if (line.startsWith("LUT_3D_SIZE")) {
        size = parseInt(line.split(/\s+/)[1], 10);
        if (isNaN(size) || size < 2 || size > 256) {
          return err(`Invalid LUT size: ${size}`);
        }
        continue;
      }

      // Skip domain directives (assume 0.0-1.0 normalized)
      if (line.startsWith("DOMAIN_MIN") || line.startsWith("DOMAIN_MAX")) {
        continue;
      }

      // Parse RGB triplets
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);

        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          values.push(r, g, b);
        }
      }
    }

    if (size === 0) {
      return err("Missing LUT_3D_SIZE directive");
    }

    const expectedCount = size * size * size * 3;
    if (values.length !== expectedCount) {
      return err(`LUT data mismatch: expected ${expectedCount} values, got ${values.length}`);
    }

    return ok({
      size,
      title,
      data: new Float32Array(values),
    });
  }
}
