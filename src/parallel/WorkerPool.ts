/**
 * WorkerPool - Wrapper around @danielsimonjr/workerpool for parallel computation
 * Provides a unified API for both Node.js and browser environments
 *
 * Optimizations:
 * - Worker pool prewarming (create workers ahead of time)
 * - Adaptive parallelization based on task size
 * - Task batching for small operations
 * - Persistent worker pool singleton
 * - Optimized chunk sizes for cache efficiency
 */

import workerpool, { PoolOptions } from '@danielsimonjr/workerpool'

export interface WorkerPoolOptions {
  minWorkers?: number | 'max'
  maxWorkers?: number
  workerType?: 'auto' | 'web' | 'process' | 'thread'
  workerTerminateTimeout?: number
  prewarm?: boolean // Create workers immediately on pool creation
}

/**
 * Optimal chunk sizes for different operations
 * Based on L1/L2 cache sizes and memory bandwidth
 */
export const OptimalChunkSizes = {
  // L1 cache is typically 32-64KB, L2 is 256KB-1MB
  // For Float64 (8 bytes), optimal chunk is 4K-8K elements
  elementWise: 8192, // 64KB chunk
  dotProduct: 4096, // 32KB chunk - memory bound
  matrixRow: 512, // One row at a time for matrix ops
  reduction: 16384 // Larger chunks for reductions
} as const

/**
 * Task batching configuration
 */
export interface BatchConfig {
  minBatchSize: number // Minimum elements per batch
  maxBatches: number // Maximum concurrent batches
}

export const DefaultBatchConfig: BatchConfig = {
  minBatchSize: 1000,
  maxBatches: 16
}

// Type alias for worker methods record
type WorkerMethods = Record<string, (...args: any[]) => any>

export interface PoolStats {
  totalWorkers: number
  busyWorkers: number
  idleWorkers: number
  pendingTasks: number
  activeTasks: number
}

/**
 * Performance metrics for the worker pool
 */
export interface PoolMetrics {
  tasksExecuted: number
  totalExecutionTime: number
  averageExecutionTime: number
  peakConcurrency: number
}

/**
 * MathWorkerPool - A worker pool for parallel math computations
 * Uses @danielsimonjr/workerpool under the hood
 *
 * Features:
 * - Automatic worker count optimization
 * - Pool prewarming for instant availability
 * - Adaptive task distribution
 * - Performance metrics tracking
 */
export class MathWorkerPool {
  private pool: any // workerpool.Pool type
  private workerScript: string | null
  private isPrewarmed: boolean = false
  private metrics: PoolMetrics

  // Singleton instance for global pool
  private static globalInstance: MathWorkerPool | null = null

  /**
   * Get or create a global worker pool singleton
   * This avoids the overhead of creating new pools for each operation
   */
  public static getGlobal(
    workerScript?: string,
    options?: WorkerPoolOptions
  ): MathWorkerPool {
    if (!MathWorkerPool.globalInstance) {
      MathWorkerPool.globalInstance = new MathWorkerPool(workerScript, {
        ...options,
        prewarm: true
      })
    }
    return MathWorkerPool.globalInstance
  }

  /**
   * Terminate the global pool
   */
  public static async terminateGlobal(): Promise<void> {
    if (MathWorkerPool.globalInstance) {
      await MathWorkerPool.globalInstance.terminate()
      MathWorkerPool.globalInstance = null
    }
  }

  /**
   * Create a new worker pool
   * @param workerScript - Path to worker script (optional, uses inline workers if not provided)
   * @param options - Pool configuration options
   */
  constructor(workerScript?: string, options?: WorkerPoolOptions) {
    this.workerScript = workerScript || null
    this.metrics = {
      tasksExecuted: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      peakConcurrency: 0
    }

    const poolOptions: PoolOptions = {
      maxWorkers: options?.maxWorkers || this.getOptimalWorkerCount(),
      workerType: options?.workerType || 'auto',
      workerTerminateTimeout: options?.workerTerminateTimeout || 1000
    }

    // Only set minWorkers if explicitly provided (workerpool validates it must be >= 0)
    if (options?.minWorkers !== undefined) {
      poolOptions.minWorkers = options.minWorkers
    }

    if (this.workerScript) {
      this.pool = workerpool.pool(this.workerScript, poolOptions)
    } else {
      this.pool = workerpool.pool(poolOptions)
    }

    // Prewarm workers if requested
    if (options?.prewarm) {
      this.prewarm().catch(() => {
        // Silently ignore prewarm failures
      })
    }
  }

  /**
   * Get optimal worker count based on available CPUs
   * Leaves one core for the main thread
   */
  private getOptimalWorkerCount(): number {
    let cpuCount = 4 // fallback

    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      cpuCount = navigator.hardwareConcurrency
    } else {
      // Node.js
      try {
        const os = require('os')
        cpuCount = os.cpus().length
      } catch {
        // Use fallback
      }
    }

    // Use n-1 workers to leave one core for main thread
    // But at least 2 workers for parallelism benefit
    return Math.max(2, cpuCount - 1)
  }

  /**
   * Prewarm the worker pool by creating all workers immediately
   * This eliminates worker creation overhead for the first task
   */
  public async prewarm(): Promise<void> {
    if (this.isPrewarmed) return

    const workerCount = this.getOptimalWorkerCount()
    const warmupTasks: Promise<any>[] = []

    // Execute no-op tasks to create workers
    for (let i = 0; i < workerCount; i++) {
      warmupTasks.push(
        this.exec(() => true, []).catch(() => {
          // Ignore warmup failures
        })
      )
    }

    await Promise.all(warmupTasks)
    this.isPrewarmed = true
  }

  /**
   * Calculate optimal batch count based on data size and operation type
   */
  public getOptimalBatchCount(
    dataSize: number,
    operationType: keyof typeof OptimalChunkSizes = 'elementWise'
  ): number {
    const optimalChunk = OptimalChunkSizes[operationType]
    const workerCount =
      this.stats().totalWorkers || this.getOptimalWorkerCount()

    // Calculate batches based on optimal chunk size
    const batchesByChunk = Math.ceil(dataSize / optimalChunk)

    // Limit to available workers (no point having more batches than workers)
    const maxBatches = Math.min(
      batchesByChunk,
      workerCount,
      DefaultBatchConfig.maxBatches
    )

    // Ensure minimum batch size
    const batchesByMinSize = Math.floor(
      dataSize / DefaultBatchConfig.minBatchSize
    )

    return Math.max(1, Math.min(maxBatches, batchesByMinSize))
  }

  /**
   * Execute a function in a worker
   * @param method - Function name or function to execute
   * @param args - Arguments to pass to the function
   * @returns Promise resolving to the result
   */
  async exec<T = any>(
    method: string | ((...args: any[]) => T),
    args?: any[]
  ): Promise<T> {
    const startTime = performance.now()

    // Track peak concurrency
    const currentStats = this.pool.stats()
    if (currentStats.busyWorkers + 1 > this.metrics.peakConcurrency) {
      this.metrics.peakConcurrency = currentStats.busyWorkers + 1
    }

    try {
      let result: T
      if (typeof method === 'function') {
        result = await (this.pool.exec(
          method as (...args: any[]) => T,
          args || []
        ) as Promise<T>)
      } else {
        result = await (this.pool.exec(method, args || []) as Promise<T>)
      }

      // Update metrics
      const executionTime = performance.now() - startTime
      this.metrics.tasksExecuted++
      this.metrics.totalExecutionTime += executionTime
      this.metrics.averageExecutionTime =
        this.metrics.totalExecutionTime / this.metrics.tasksExecuted

      return result
    } catch (error) {
      // Still track execution time for failed tasks
      const executionTime = performance.now() - startTime
      this.metrics.tasksExecuted++
      this.metrics.totalExecutionTime += executionTime
      this.metrics.averageExecutionTime =
        this.metrics.totalExecutionTime / this.metrics.tasksExecuted

      throw error
    }
  }

  /**
   * Execute a function on all workers in parallel
   * @param method - Function to execute
   * @param argsArray - Array of argument arrays, one per execution
   * @returns Promise resolving to array of results
   */
  async map<T = any, R = any>(
    method: string | ((arg: T) => R),
    items: T[]
  ): Promise<R[]> {
    const promises = items.map((item) => this.exec<R>(method as any, [item]))
    return Promise.all(promises)
  }

  /**
   * Execute multiple independent tasks in parallel
   * @param tasks - Array of {method, args} objects
   * @returns Promise resolving to array of results
   */
  async parallel<T = any>(
    tasks: Array<{ method: string | ((...args: any[]) => T); args?: any[] }>
  ): Promise<T[]> {
    const promises = tasks.map((task) => this.exec<T>(task.method, task.args))
    return Promise.all(promises)
  }

  /**
   * Create a proxy to call worker methods directly
   * @returns Proxy object with worker methods
   */
  async proxy<T = any>(): Promise<T> {
    const p = await this.pool.proxy()
    return p as unknown as T
  }

  /**
   * Get pool statistics
   */
  stats(): PoolStats {
    const s = this.pool.stats()
    return {
      totalWorkers: s.totalWorkers,
      busyWorkers: s.busyWorkers,
      idleWorkers: s.idleWorkers,
      pendingTasks: s.pendingTasks,
      activeTasks: s.activeTasks
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PoolMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      tasksExecuted: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      peakConcurrency: 0
    }
  }

  /**
   * Check if pool is prewarmed
   */
  get isReady(): boolean {
    return this.isPrewarmed
  }

  /**
   * Terminate all workers and close the pool
   * @param force - Force immediate termination
   * @param timeout - Timeout in ms before force termination
   */
  async terminate(force?: boolean, timeout?: number): Promise<void> {
    await this.pool.terminate(force, timeout)
  }

  /**
   * Check if pool has been terminated
   */
  get terminated(): boolean {
    return this.pool.stats().totalWorkers === 0
  }

  /**
   * Get number of active workers
   */
  get workerCount(): number {
    return this.pool.stats().totalWorkers
  }

  /**
   * Get number of pending tasks in queue
   */
  get pendingCount(): number {
    return this.pool.stats().pendingTasks
  }

  /**
   * Get number of currently executing tasks
   */
  get activeCount(): number {
    return this.pool.stats().activeTasks
  }
}

/**
 * Create a dedicated worker for math operations
 */
export function createMathWorker(): WorkerMethods {
  return {
    // Matrix operations
    matrixMultiply: (
      a: number[],
      aRows: number,
      aCols: number,
      b: number[],
      bRows: number,
      bCols: number
    ): number[] => {
      const result = new Array(aRows * bCols)
      for (let i = 0; i < aRows; i++) {
        for (let j = 0; j < bCols; j++) {
          let sum = 0
          for (let k = 0; k < aCols; k++) {
            sum += a[i * aCols + k] * b[k * bCols + j]
          }
          result[i * bCols + j] = sum
        }
      }
      return result
    },

    matrixAdd: (a: number[], b: number[]): number[] => {
      const result = new Array(a.length)
      for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i]
      }
      return result
    },

    dotProduct: (a: number[], b: number[]): number => {
      let sum = 0
      for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i]
      }
      return sum
    },

    sum: (arr: number[]): number => {
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
      }
      return sum
    },

    mean: (arr: number[]): number => {
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
      }
      return sum / arr.length
    },

    // Chunk processing for large arrays
    processChunk: (
      data: number[],
      operation: string,
      start: number,
      end: number
    ): number => {
      let result = 0
      switch (operation) {
        case 'sum':
          for (let i = start; i < end; i++) result += data[i]
          break
        case 'min':
          result = data[start]
          for (let i = start + 1; i < end; i++)
            if (data[i] < result) result = data[i]
          break
        case 'max':
          result = data[start]
          for (let i = start + 1; i < end; i++)
            if (data[i] > result) result = data[i]
          break
      }
      return result
    }
  }
}

// Export workerpool for direct access if needed
export { workerpool }

// Legacy export for backward compatibility
export { MathWorkerPool as WorkerPool }
