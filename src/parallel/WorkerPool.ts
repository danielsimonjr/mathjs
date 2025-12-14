/**
 * WorkerPool - Wrapper around @danielsimonjr/workerpool for parallel computation
 * Provides a unified API for both Node.js and browser environments
 */

import workerpool, { PoolOptions } from '@danielsimonjr/workerpool'

export interface WorkerPoolOptions {
  minWorkers?: number | 'max'
  maxWorkers?: number
  workerType?: 'auto' | 'web' | 'process' | 'thread'
  workerTerminateTimeout?: number
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
 * MathWorkerPool - A worker pool for parallel math computations
 * Uses @danielsimonjr/workerpool under the hood
 */
export class MathWorkerPool {
  private pool: workerpool.Pool
  private workerScript: string | null

  /**
   * Create a new worker pool
   * @param workerScript - Path to worker script (optional, uses inline workers if not provided)
   * @param options - Pool configuration options
   */
  constructor(workerScript?: string, options?: WorkerPoolOptions) {
    this.workerScript = workerScript || null

    const poolOptions: PoolOptions = {
      minWorkers: options?.minWorkers,
      maxWorkers: options?.maxWorkers || this.getOptimalWorkerCount(),
      workerType: options?.workerType || 'auto',
      workerTerminateTimeout: options?.workerTerminateTimeout || 1000
    }

    if (this.workerScript) {
      this.pool = workerpool.pool(this.workerScript, poolOptions)
    } else {
      this.pool = workerpool.pool(poolOptions)
    }
  }

  /**
   * Get optimal worker count based on available CPUs
   */
  private getOptimalWorkerCount(): number {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      return Math.max(2, navigator.hardwareConcurrency - 1)
    }
    // Node.js
    try {
      const os = require('os')
      return Math.max(2, os.cpus().length - 1)
    } catch {
      return 4 // fallback
    }
  }

  /**
   * Execute a function in a worker
   * @param method - Function name or function to execute
   * @param args - Arguments to pass to the function
   * @returns Promise resolving to the result
   */
  async exec<T = any>(method: string | ((...args: any[]) => T), args?: any[]): Promise<T> {
    if (typeof method === 'function') {
      return this.pool.exec(method as (...args: any[]) => T, args || []) as Promise<T>
    }
    return this.pool.exec(method, args || []) as Promise<T>
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
    const promises = items.map(item =>
      this.exec<R>(method as any, [item])
    )
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
    const promises = tasks.map(task =>
      this.exec<T>(task.method, task.args)
    )
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
    matrixMultiply: (a: number[], aRows: number, aCols: number,
                     b: number[], bRows: number, bCols: number): number[] => {
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
    processChunk: (data: number[], operation: string, start: number, end: number): number => {
      let result = 0
      switch (operation) {
        case 'sum':
          for (let i = start; i < end; i++) result += data[i]
          break
        case 'min':
          result = data[start]
          for (let i = start + 1; i < end; i++) if (data[i] < result) result = data[i]
          break
        case 'max':
          result = data[start]
          for (let i = start + 1; i < end; i++) if (data[i] > result) result = data[i]
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
