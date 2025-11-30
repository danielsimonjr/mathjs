// function utils

import { lruQueue } from './lruQueue.js'

// Interface for memoize options
interface MemoizeOptions {
  hasher?: (args: any[]) => string
  limit?: number
}

// Interface for the cache structure
interface MemoizeCache {
  values: Map<string, any>
  lru: ReturnType<typeof lruQueue>
}

// Interface for memoized function
interface MemoizedFunction {
  (...args: any[]): any
  cache?: MemoizeCache
}

/**
 * Memoize a given function by caching the computed result.
 * The cache of a memoized function can be cleared by deleting the `cache`
 * property of the function.
 *
 * @param {function} fn                     The function to be memoized.
 *                                          Must be a pure function.
 * @param {Object} [options]
 * @param {function(args: Array): string} [options.hasher]
 *    A custom hash builder. Is JSON.stringify by default.
 * @param {number | undefined} [options.limit]
 *    Maximum number of values that may be cached. Undefined indicates
 *    unlimited (default)
 * @return {function}                       Returns the memoized function
 */
export function memoize (fn: (...args: any[]) => any, options: MemoizeOptions = {}): MemoizedFunction {
  const limit = options.limit == null ? Number.POSITIVE_INFINITY : options.limit
  const hasher = options.hasher == null ? JSON.stringify : options.hasher

  const memoized: MemoizedFunction = function (...callArgs: any[]): any {
    const self = memoized as MemoizedFunction
    if (typeof self.cache !== 'object') {
      self.cache = {
        values: new Map(),
        lru: lruQueue(limit || Number.POSITIVE_INFINITY)
      }
    }

    const hash = hasher(callArgs)

    if (self.cache!.values.has(hash)) {
      self.cache!.lru.hit(hash)
      return self.cache!.values.get(hash)
    }

    const newVal = fn.apply(fn, callArgs)
    self.cache!.values.set(hash, newVal)
    self.cache!.values.delete(self.cache!.lru.hit(hash))

    return newVal
  }

  return memoized
}

// Interface for memoizeCompare cached entry
interface CacheEntry {
  args: any[]
  res: any
}

// Interface for memoizeCompare function
interface MemoizedCompareFunction {
  (...args: any[]): any
  cache: CacheEntry[]
}

/**
 * Memoize a given function by caching all results and the arguments,
 * and comparing against the arguments of previous results before
 * executing again.
 * This is less performant than `memoize` which calculates a hash,
 * which is very fast to compare. Use `memoizeCompare` only when it is
 * not possible to create a unique serializable hash from the function
 * arguments.
 * The isEqual function must compare two sets of arguments
 * and return true when equal (can be a deep equality check for example).
 * @param {function} fn
 * @param {function(a: *, b: *) : boolean} isEqual
 * @returns {function}
 */
export function memoizeCompare (fn: (...args: any[]) => any, isEqual: (a: any[], b: any[]) => boolean): MemoizedCompareFunction {
  const memoized: MemoizedCompareFunction = Object.assign(
    function (...callArgs: any[]): any {
      for (let c = 0; c < memoized.cache.length; c++) {
        const cached = memoized.cache[c]

        if (isEqual(callArgs, cached.args)) {
          // TODO: move this cache entry to the top so recently used entries move up?
          return cached.res
        }
      }

      const res = fn.apply(fn, callArgs)
      memoized.cache.unshift({ args: callArgs, res })

      return res
    },
    { cache: [] as CacheEntry[] }
  )

  return memoized
}
