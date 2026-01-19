/**
 * ParallelWasm - Combines WASM acceleration with multi-core parallelization
 *
 * Strategy:
 * - Small operations: Use single-threaded JS (minimal overhead)
 * - Medium operations: Use single-threaded WASM (10-100x speedup)
 * - Large operations: Use parallel processing with SharedArrayBuffer
 *
 * Note: True parallel WASM requires each worker to load its own WASM instance.
 * For now, we use parallel JS with SharedArrayBuffer for large operations,
 * and single-threaded WASM for medium operations.
 */

import { MathWorkerPool, OptimalChunkSizes } from './WorkerPool.ts'

export interface ParallelWasmConfig {
  maxWorkers?: number
  minSizeForWasm?: number
  minSizeForParallel?: number
  useSharedMemory?: boolean
}

/**
 * Thresholds for execution strategy selection
 */
export const ParallelWasmThresholds = {
  // Use WASM for operations above this size (single-threaded)
  wasm: {
    dotProduct: 100,
    elementWise: 100,
    statistics: 100,
    matrixMultiply: 64
  },
  // Use parallel processing above this size
  parallel: {
    dotProduct: 100000,
    elementWise: 100000,
    statistics: 500000,
    matrixMultiply: 10000
  }
} as const

// WASM module (loaded lazily)
let wasmModule: any = null
let wasmLoadPromise: Promise<any> | null = null

/**
 * Load the WASM module
 */
async function loadWasm(): Promise<any> {
  if (wasmModule) return wasmModule

  if (wasmLoadPromise) return wasmLoadPromise

  wasmLoadPromise = import('../../lib/wasm/index.js')
    .then((mod) => {
      wasmModule = mod
      return mod
    })
    .catch((): null => {
      wasmModule = null
      return null
    })

  return wasmLoadPromise
}

export class ParallelWasm {
  private static config: Required<ParallelWasmConfig> = {
    maxWorkers: 0, // 0 = auto-detect
    minSizeForWasm: 100,
    minSizeForParallel: 100000,
    useSharedMemory: typeof SharedArrayBuffer !== 'undefined'
  }

  private static workerPool: MathWorkerPool | null = null

  /**
   * Configure parallel WASM settings
   */
  public static configure(config: Partial<ParallelWasmConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Initialize WASM module
   */
  public static async initWasm(): Promise<boolean> {
    const mod = await loadWasm()
    return mod !== null
  }

  /**
   * Check if WASM is available
   */
  public static isWasmAvailable(): boolean {
    return wasmModule !== null
  }

  /**
   * Get or create worker pool
   */
  private static getPool(): MathWorkerPool {
    if (!this.workerPool) {
      this.workerPool = MathWorkerPool.getGlobal(undefined, {
        maxWorkers: this.config.maxWorkers || undefined,
        prewarm: false // Don't prewarm by default
      })
    }
    return this.workerPool
  }

  /**
   * Determine the best execution strategy
   */
  public static getStrategy(
    size: number,
    operationType: keyof typeof ParallelWasmThresholds.wasm
  ): 'js' | 'wasm' | 'parallel' {
    const wasmThreshold = ParallelWasmThresholds.wasm[operationType]
    const parallelThreshold = ParallelWasmThresholds.parallel[operationType]

    if (size >= parallelThreshold && this.config.useSharedMemory) {
      return 'parallel'
    } else if (size >= wasmThreshold && wasmModule) {
      return 'wasm'
    } else {
      return 'js'
    }
  }

  // ===========================================================================
  // DOT PRODUCT
  // ===========================================================================

  /**
   * Compute dot product with automatic strategy selection
   */
  public static async dotProduct(
    a: Float64Array,
    b: Float64Array
  ): Promise<number> {
    const size = a.length
    const strategy = this.getStrategy(size, 'dotProduct')

    switch (strategy) {
      case 'parallel':
        return this.dotProductParallel(a, b)
      case 'wasm':
        return this.dotProductWasm(a, b)
      default:
        return this.dotProductJS(a, b)
    }
  }

  private static dotProductJS(a: Float64Array, b: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i]
    }
    return sum
  }

  private static dotProductWasm(a: Float64Array, b: Float64Array): number {
    if (!wasmModule) return this.dotProductJS(a, b)

    // Use SIMD version if available, otherwise standard
    if (wasmModule.simdDotF64) {
      return wasmModule.simdDotF64(a, b, a.length)
    }
    return wasmModule.dotProduct(a, b, a.length)
  }

  private static async dotProductParallel(
    a: Float64Array,
    b: Float64Array
  ): Promise<number> {
    const pool = this.getPool()
    const size = a.length
    const workerCount = Math.min(
      pool.getOptimalBatchCount(size, 'dotProduct'),
      8
    )
    const chunkSize = Math.ceil(size / workerCount)

    // Create SharedArrayBuffers for zero-copy transfer
    const sharedA = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedB = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    new Float64Array(sharedA).set(a)
    new Float64Array(sharedB).set(b)

    // Create tasks
    const tasks: Promise<number>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      if (start >= size) break

      const task = pool.exec(
        (params: {
          sharedA: SharedArrayBuffer
          sharedB: SharedArrayBuffer
          start: number
          end: number
        }) => {
          const a = new Float64Array(params.sharedA)
          const b = new Float64Array(params.sharedB)
          let sum = 0
          for (let i = params.start; i < params.end; i++) {
            sum += a[i] * b[i]
          }
          return sum
        },
        [{ sharedA, sharedB, start, end }]
      )
      tasks.push(task)
    }

    const partialSums = await Promise.all(tasks)
    return partialSums.reduce((acc, val) => acc + val, 0)
  }

  // ===========================================================================
  // SUM
  // ===========================================================================

  /**
   * Compute sum with automatic strategy selection
   */
  public static async sum(data: Float64Array): Promise<number> {
    const size = data.length
    const strategy = this.getStrategy(size, 'statistics')

    switch (strategy) {
      case 'parallel':
        return this.sumParallel(data)
      case 'wasm':
        return this.sumWasm(data)
      default:
        return this.sumJS(data)
    }
  }

  private static sumJS(data: Float64Array): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    return sum
  }

  private static sumWasm(data: Float64Array): number {
    if (!wasmModule) return this.sumJS(data)

    if (wasmModule.simdSumF64) {
      return wasmModule.simdSumF64(data, data.length)
    }
    return this.sumJS(data)
  }

  private static async sumParallel(data: Float64Array): Promise<number> {
    const pool = this.getPool()
    const size = data.length
    const workerCount = Math.min(
      pool.getOptimalBatchCount(size, 'reduction'),
      8
    )
    const chunkSize = Math.ceil(size / workerCount)

    const shared = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    new Float64Array(shared).set(data)

    const tasks: Promise<number>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      if (start >= size) break

      const task = pool.exec(
        (params: { shared: SharedArrayBuffer; start: number; end: number }) => {
          const arr = new Float64Array(params.shared)
          let sum = 0
          for (let i = params.start; i < params.end; i++) {
            sum += arr[i]
          }
          return sum
        },
        [{ shared, start, end }]
      )
      tasks.push(task)
    }

    const partialSums = await Promise.all(tasks)
    return partialSums.reduce((acc, val) => acc + val, 0)
  }

  // ===========================================================================
  // ADD
  // ===========================================================================

  /**
   * Element-wise addition with automatic strategy selection
   */
  public static async add(
    a: Float64Array,
    b: Float64Array
  ): Promise<Float64Array> {
    const size = a.length
    const strategy = this.getStrategy(size, 'elementWise')

    switch (strategy) {
      case 'parallel':
        return this.addParallel(a, b)
      case 'wasm':
        return this.addWasm(a, b)
      default:
        return this.addJS(a, b)
    }
  }

  private static addJS(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] + b[i]
    }
    return result
  }

  private static addWasm(a: Float64Array, b: Float64Array): Float64Array {
    if (!wasmModule) return this.addJS(a, b)

    if (wasmModule.simdAddF64) {
      const result = new Float64Array(a.length)
      wasmModule.simdAddF64(a, b, result, a.length)
      return result
    }

    // Fall back to standard WASM add if available
    if (wasmModule.add) {
      return wasmModule.add(a, b, a.length)
    }

    return this.addJS(a, b)
  }

  private static async addParallel(
    a: Float64Array,
    b: Float64Array
  ): Promise<Float64Array> {
    const pool = this.getPool()
    const size = a.length
    const workerCount = Math.min(
      pool.getOptimalBatchCount(size, 'elementWise'),
      8
    )
    const chunkSize = Math.ceil(size / workerCount)

    const sharedA = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedB = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedResult = new SharedArrayBuffer(
      size * Float64Array.BYTES_PER_ELEMENT
    )

    new Float64Array(sharedA).set(a)
    new Float64Array(sharedB).set(b)

    const tasks: Promise<void>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      if (start >= size) break

      const task = pool.exec(
        (params: {
          sharedA: SharedArrayBuffer
          sharedB: SharedArrayBuffer
          sharedResult: SharedArrayBuffer
          start: number
          end: number
        }) => {
          const a = new Float64Array(params.sharedA)
          const b = new Float64Array(params.sharedB)
          const result = new Float64Array(params.sharedResult)
          for (let i = params.start; i < params.end; i++) {
            result[i] = a[i] + b[i]
          }
        },
        [{ sharedA, sharedB, sharedResult, start, end }]
      )
      tasks.push(task)
    }

    await Promise.all(tasks)
    return new Float64Array(sharedResult)
  }

  // ===========================================================================
  // MEAN & STD
  // ===========================================================================

  /**
   * Compute mean with automatic strategy selection
   */
  public static async mean(data: Float64Array): Promise<number> {
    const sum = await this.sum(data)
    return sum / data.length
  }

  /**
   * Compute standard deviation with automatic strategy selection
   */
  public static async std(data: Float64Array, ddof: number = 0): Promise<number> {
    const size = data.length
    const strategy = this.getStrategy(size, 'statistics')

    if (strategy === 'wasm' && wasmModule?.simdStdF64) {
      return wasmModule.simdStdF64(data, size, ddof)
    }

    // JS fallback (also used for parallel - compute mean first, then variance)
    const mean = await this.mean(data)
    let sumSq = 0
    for (let i = 0; i < size; i++) {
      const diff = data[i] - mean
      sumSq += diff * diff
    }
    return Math.sqrt(sumSq / (size - ddof))
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Get execution plan for debugging
   */
  public static getExecutionPlan(
    size: number,
    operationType: keyof typeof ParallelWasmThresholds.wasm
  ): {
    strategy: string
    wasmAvailable: boolean
    sharedMemoryAvailable: boolean
  } {
    return {
      strategy: this.getStrategy(size, operationType),
      wasmAvailable: wasmModule !== null,
      sharedMemoryAvailable: this.config.useSharedMemory
    }
  }

  /**
   * Get current thresholds
   */
  public static getThresholds(): typeof ParallelWasmThresholds {
    return ParallelWasmThresholds
  }

  /**
   * Cleanup resources
   */
  public static async terminate(): Promise<void> {
    if (this.workerPool) {
      await this.workerPool.terminate()
      this.workerPool = null
    }
  }
}
