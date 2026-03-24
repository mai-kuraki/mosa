import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

/**
 * Compute a SHA-256 hash (first 16 hex chars) of a file for dedup / change detection.
 */
export async function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex").slice(0, 32)));
    stream.on("error", reject);
  });
}
