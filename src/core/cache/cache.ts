import NodeCache from "node-cache";

import { log } from "@/core/log";

const cache = new NodeCache({ stdTTL: 300 });

let hits = 0;
let misses = 0;

export function getCache<T>(key: string): T | undefined {
  const value = cache.get<T>(key);
  if (value) {
    hits++;
    log.info(`[Cache] HIT for key: ${key}, total hits: ${hits}`);
  } else {
    misses++;
    log.info(`[Cache] MISS for key: ${key}, total misses: ${misses}`);
  }
  return value;
}

export function setCache<T>(key: string, value: T): void {
  cache.set(key, value);
  log.info(`[Cache] SET for key: ${key}`);
}
