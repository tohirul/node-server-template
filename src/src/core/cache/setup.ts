// src/core/cache/setup.ts
import { loadCacheFromDisk, saveCacheToDisk } from "@/core/cache/persist";

export function setupCachePersistence() {
  loadCacheFromDisk();

  process.on("SIGINT", () => {
    saveCacheToDisk();
    process.exit();
  });

  process.on("SIGTERM", () => {
    saveCacheToDisk();
    process.exit();
  });
}
