/**
 * ParallelWasm - Combines WASM acceleration with multi-core parallelization
 *
 * Strategy:
 * - Small operations: Use single-threaded WASM (minimal overhead)
 * - Medium operations: Use WASM with SIMD (2-4x speedup)
 * - Large operations: Use parallel WASM workers (additional 2-4x speedup)
 *
 * Target: WASM speedup (10-100x) × parallel speedup (2-4x) = 20-400x total
 */

import { MathWorkerPool, OptimalChunkSizes } from './WorkerPool.ts'
import { wasmLoader, WasmModule } from '../wasm/WasmLoader.ts'
import { WasmThresholds } from '../wasm/MatrixWasmBridge.ts'

export interface ParallelWasmConfig {
  maxWorkers?: number
  minSizeForParallel?: number
  useSharedMemory?: boolean
  wasmPath?: string
}

/**
 * Thresholds for parallel WASM execution
 * These are higher than single-threaded WASM thresholds because
 * worker creation/communication adds overhead
 */
export const ParallelWasmThresholds = {
  // Need at least 10K elements to benefit from parallel WASM
  dotProduct: 10000,
  // Matrix multiply benefits earlier due to O(n³) complexity
  matrixMultiply: 2500, // 50x50 matrix
  // Element-wise ops need more data to overcome overhead
  elementWise: 50000,
  // FFT benefits from parallel for large sizes
  fft: 8192,
  // Statistics operations
  statistics: 100000
} as const

export class ParallelWasm {
  private static config: Required<ParallelWasmConfig> = {
    maxWorkers: 0, // 0 = auto-detect
    minSizeForParallel: ParallelWasmThresholds.elementWise,
    useSharedMemory: typeof SharedArrayBuffer !== 'undefined',
    wasmPath: ''
  }

  private static workerPool: MathWorkerPool | null = null
  private static wasmInitialized: boolean = false

  /**
   * Configure parallel WASM settings
   */
  public static configure(config: Partial<ParallelWasmConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Initialize WASM module (main thread)
   */
  public static async initWasm(wasmPath?: string): Promise<void> {
    if (this.wasmInitialized) return

    try {
      await wasmLoader.load(wasmPath || this.config.wasmPath || undefined)
      this.wasmInitialized = true
    } catch {
      // WASM not available, will use JS fallback
      this.wasmInitialized = false
    }
  }

  /**
   * Get or create worker pool
   */
  private static getPool(): MathWorkerPool {
    if (!this.workerPool) {
      this.workerPool = MathWorkerPool.getGlobal(undefined, {
        maxWorkers: this.config.maxWorkers || undefined,
        prewarm: true
      })
    }
    return this.workerPool
  }

  /**
   * Determine the best execution strategy
   */
  private static getStrategy(
    size: number,
    operationType: keyof typeof ParallelWasmThresholds
  ): 'js' | 'wasm' | 'parallel-wasm' {
    const parallelThreshold = ParallelWasmThresholds[operationType]
    const wasmThreshold = WasmThresholds[operationType as keyof typeof WasmThresholds] || 100

    if (size >= parallelThreshold && this.config.useSharedMemory) {
      return 'parallel-wasm'
    } else if (size >= wasmThreshold && this.wasmInitialized) {
      return 'wasm'
    } else {
      return 'js'
    }
  }

  /**
   * Parallel dot product using SharedArrayBuffer
   * Each worker computes a partial sum, then results are combined
   */
  public static async dotProduct(
    a: Float64Array,
    b: Float64Array
  ): Promise<number> {
    const size = a.length
    const strategy = this.getStrategy(size, 'dotProduct')

    if (strategy === 'js') {
      return this.dotProductJS(a, b)
    } else if (strategy === 'wasm') {
      return this.dotProductWasm(a, b)
    } else {
      return this.dotProductParallel(a, b)
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
    const module = wasmLoader.getModule()
    if (!module) return this.dotProductJS(a, b)

    const aAlloc = wasmLoader.allocateFloat64Array(a)
    const bAlloc = wasmLoader.allocateFloat64Array(b)

    try {
      return module.dotProduct(aAlloc.ptr, bAlloc.ptr, a.length)
    } finally {
      wasmLoader.release(aAlloc.ptr)
      wasmLoader.release(bAlloc.ptr)
    }
  }

  private static async dotProductParallel(
    a: Float64Array,
    b: Float64Array
  ): Promise<number> {
    const pool = this.getPool()
    const workerCount = pool.getOptimalBatchCount(a.length, 'dotProduct')
    const chunkSize = Math.ceil(a.length / workerCount)

    // Create SharedArrayBuffers for zero-copy transfer
    const sharedA = new SharedArrayBuffer(a.length * Float64Array.BYTES_PER_ELEMENT)
    const sharedB = new SharedArrayBuffer(b.length * Float64Array.BYTES_PER_ELEMENT)
    const viewA = new Float64Array(sharedA)
    const viewB = new Float64Array(sharedB)
    viewA.set(a)
    viewB.set(b)

    // Create tasks for parallel execution
    const tasks: Promise<number>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, a.length)

      if (start >= a.length) break

      // Each worker computes partial dot product
      const task = pool.exec(
        (params: { sharedA: SharedArrayBuffer; sharedB: SharedArrayBuffer; start: number; end: number }) => {
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

  /**
   * Parallel sum using SharedArrayBuffer
   */
  public static async sum(data: Float64Array): Promise<number> {
    const size = data.length
    const strategy = this.getStrategy(size, 'statistics')

    if (strategy === 'js') {
      return this.sumJS(data)
    } else if (strategy === 'wasm') {
      return this.sumWasm(data)
    } else {
      return this.sumParallel(data)
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
    // Use SIMD sum if available
    const module = wasmLoader.getModule()
    if (!module) return this.sumJS(data)

    // Note: Would need simdSumF64 in WASM module
    // For now, fall back to JS
    return this.sumJS(data)
  }

  private static async sumParallel(data: Float64Array): Promise<number> {
    const pool = this.getPool()
    const workerCount = pool.getOptimalBatchCount(data.length, 'reduction')
    const chunkSize = Math.ceil(data.length / workerCount)

    const shared = new SharedArrayBuffer(data.length * Float64Array.BYTES_PER_ELEMENT)
    const view = new Float64Array(shared)
    view.set(data)

    const tasks: Promise<number>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, data.length)

      if (start >= data.length) break

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

  /**
   * Parallel element-wise addition
   */
  public static async add(
    a: Float64Array,
    b: Float64Array
  ): Promise<Float64Array> {
    const size = a.length
    const strategy = this.getStrategy(size, 'elementWise')

    if (strategy === 'js') {
      return this.addJS(a, b)
    } else if (strategy === 'wasm') {
      return this.addWasm(a, b)
    } else {
      return this.addParallel(a, b)
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
    const module = wasmLoader.getModule()
    if (!module) return this.addJS(a, b)

    const aAlloc = wasmLoader.allocateFloat64Array(a)
    const bAlloc = wasmLoader.allocateFloat64Array(b)
    const resultAlloc = wasmLoader.allocateFloat64ArrayEmpty(a.length)

    try {
      module.add(aAlloc.ptr, bAlloc.ptr, a.length, resultAlloc.ptr)
      return new Float64Array(resultAlloc.array)
    } finally {
      wasmLoader.release(aAlloc.ptr)
      wasmLoader.release(bAlloc.ptr)
      wasmLoader.release(resultAlloc.ptr)
    }
  }

  private static async addParallel(
    a: Float64Array,
    b: Float64Array
  ): Promise<Float64Array> {
    const pool = this.getPool()
    const workerCount = pool.getOptimalBatchCount(a.length, 'elementWise')
    const chunkSize = Math.ceil(a.length / workerCount)

    const sharedA = new SharedArrayBuffer(a.length * Float64Array.BYTES_PER_ELEMENT)
    const sharedB = new SharedArrayBuffer(b.length * Float64Array.BYTES_PER_ELEMENT)
    const sharedResult = new SharedArrayBuffer(a.length * Float64Array.BYTES_PER_ELEMENT)

    const viewA = new Float64Array(sharedA)
    const viewB = new Float64Array(sharedB)
    viewA.set(a)
    viewB.set(b)

    const tasks: Promise<void>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, a.length)

      if (start >= a.length) break

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

  /**
   * Get current strategy for a given size and operation
   */
  public static getExecutionPlan(
    size: number,
    operationType: keyof typeof ParallelWasmThresholds
  ): { strategy: string; workerCount: number; chunkSize: number } {
    const strategy = this.getStrategy(size, operationType)
    const pool = this.getPool()
    const workerCount =
      strategy === 'parallel-wasm'
        ? pool.getOptimalBatchCount(
            size,
            operationType === 'dotProduct'
              ? 'dotProduct'
              : operationType === 'statistics'
                ? 'reduction'
                : 'elementWise'
          )
        : 1
    const chunkSize = Math.ceil(size / workerCount)

    return {
      strategy,
      workerCount,
      chunkSize
    }
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
