import fs from "fs";
import path from "path";

import cache from "@/core/cache";

const cacheFilePath = path.resolve(__dirname, "../../../.cache/cache.json");

// Dirty flag
let isDirty = false;

export function markCacheAsDirty() {
  isDirty = true;
}

export function loadCacheFromDisk() {
  if (fs.existsSync(cacheFilePath)) {
    try {
      const raw = fs.readFileSync(cacheFilePath, "utf-8");
      if (raw.trim().length === 0) {
        console.warn("[cache] Skipped loading: cache file is empty");
        return;
      }

      const parsed = JSON.parse(raw);
      const entries = Object.entries(parsed).map(([key, val]) => ({
        key,
        val,
      }));
      cache.mset(entries);
      console.log("[cache] Loaded cache from disk");
    } catch (error) {
      console.error("[cache] Failed to load cache:", error);
    }
  }
}

export function saveCacheToDisk() {
  if (!isDirty) return; // ✅ only save if dirty

  try {
    const keys = cache.keys();
    const allData: Record<string, any> = {};
    for (const key of keys) {
      const val = cache.get(key);
      if (val !== undefined) {
        allData[key] = val;
      }
    }

    fs.mkdirSync(path.dirname(cacheFilePath), { recursive: true });
    fs.writeFileSync(cacheFilePath, JSON.stringify(allData, null, 2), "utf-8");
    console.log("[cache] Saved cache to disk");
    isDirty = false; // ✅ reset dirty flag
  } catch (error) {
    console.error("[cache] Failed to save cache:", error);
  }
}

// Utility: delete all keys that start with a prefix
export const deleteAllMatchingKeys = (prefix: string) => {
  const keys = cache.keys();
  const toDelete = keys.filter((key) => key.startsWith(prefix));
  cache.del(toDelete);
};

// Optional: for debugging/testing
export function isCacheDirty() {
  return isDirty;
}
