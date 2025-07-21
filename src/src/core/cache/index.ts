import NodeCache from "node-cache";

import { markCacheAsDirty } from "@/core/cache/persist";

type Key = string | number;

const cache = new NodeCache();

const originalSet = cache.set.bind(cache);
const originalMset = cache.mset.bind(cache);
const originalDel = cache.del.bind(cache);

cache.set = function <T>(key: Key, value: T, ttl?: string | number): boolean {
  markCacheAsDirty();
  return ttl !== undefined
    ? originalSet(key, value, ttl)
    : originalSet(key, value);
};

cache.mset = (...args) => {
  markCacheAsDirty();
  return originalMset(...args);
};

cache.del = (...args) => {
  markCacheAsDirty();
  return originalDel(...args);
};

export default cache;
