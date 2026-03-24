import type { LutData } from "./cube-parser";

/**
 * LRU cache for parsed LUT data.
 * A 64^3 3D LUT is ~3MB in memory; caching avoids repeated file reads and parsing.
 */
export class LutCache {
  private cache = new Map<string, { data: LutData; lastAccess: number }>();
  private maxEntries: number;

  constructor(maxEntries = 10) {
    this.maxEntries = maxEntries;
  }

  get(key: string): LutData | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      return entry.data;
    }
    return undefined;
  }

  set(key: string, data: LutData): void {
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }
    this.cache.set(key, { data, lastAccess: Date.now() });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
