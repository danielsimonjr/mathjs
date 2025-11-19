/**
 * ParallelMatrix provides parallel/multicore operations for matrix computations
 * Uses SharedArrayBuffer for zero-copy data sharing between workers
 */

import { WorkerPool } from './WorkerPool.js'

export interface MatrixData {
  data: Float64Array | SharedArrayBuffer
  rows: number
  cols: number
  isShared: boolean
}

export interface ParallelConfig {
  minSizeForParallel?: number
  workerScript?: string
  maxWorkers?: number
  useSharedMemory?: boolean
}

export class ParallelMatrix {
  private static workerPool: WorkerPool | null = null
  private static config: Required<ParallelConfig> = {
    minSizeForParallel: 1000,
    workerScript: new URL('./matrix.worker.js', import.meta.url).href,
    maxWorkers: 0, // 0 means auto-detect
    useSharedMemory: typeof SharedArrayBuffer !== 'undefined'
  }

  public static configure(config: ParallelConfig): void {
    this.config = { ...this.config, ...config }
    if (this.workerPool) {
      this.workerPool.terminate()
      this.workerPool = null
    }
  }

  private static getWorkerPool(): WorkerPool {
    if (!this.workerPool) {
      this.workerPool = new WorkerPool(
        this.config.workerScript,
        this.config.maxWorkers || undefined
      )
    }
    return this.workerPool
  }

  /**
   * Determines if an operation should use parallel processing
   */
  private static shouldUseParallel(size: number): boolean {
    return size >= this.config.minSizeForParallel
  }

  /**
   * Convert regular array to SharedArrayBuffer if possible
   */
  private static toSharedBuffer(data: number[] | Float64Array): Float64Array {
    if (!this.config.useSharedMemory) {
      return data instanceof Float64Array ? data : new Float64Array(data)
    }

    const buffer = new SharedArrayBuffer(data.length * Float64Array.BYTES_PER_ELEMENT)
    const sharedArray = new Float64Array(buffer)
    sharedArray.set(data)
    return sharedArray
  }

  /**
   * Parallel matrix multiplication: C = A * B
   * Divides work across multiple workers by rows
   */
  public static async multiply(
    aData: number[] | Float64Array,
    aRows: number,
    aCols: number,
    bData: number[] | Float64Array,
    bRows: number,
    bCols: number
  ): Promise<Float64Array> {
    const totalSize = aRows * aCols + bRows * bCols

    if (!this.shouldUseParallel(totalSize)) {
      // Use sequential implementation for small matrices
      return this.multiplySequential(aData, aRows, aCols, bData, bRows, bCols)
    }

    const pool = this.getWorkerPool()
    const workerCount = pool.workerCount
    const rowsPerWorker = Math.ceil(aRows / workerCount)

    // Convert to shared buffers for zero-copy transfer
    const aShared = this.toSharedBuffer(aData)
    const bShared = this.toSharedBuffer(bData)
    const resultBuffer = this.config.useSharedMemory
      ? new SharedArrayBuffer(aRows * bCols * Float64Array.BYTES_PER_ELEMENT)
      : new ArrayBuffer(aRows * bCols * Float64Array.BYTES_PER_ELEMENT)
    const result = new Float64Array(resultBuffer)

    // Create tasks for each worker
    const tasks: Promise<void>[] = []
    for (let i = 0; i < workerCount; i++) {
      const startRow = i * rowsPerWorker
      const endRow = Math.min(startRow + rowsPerWorker, aRows)

      if (startRow >= aRows) break

      const task = pool.execute({
        operation: 'multiply',
        aData: aShared,
        aRows,
        aCols,
        bData: bShared,
        bRows,
        bCols,
        startRow,
        endRow,
        resultData: result
      })

      tasks.push(task)
    }

    await Promise.all(tasks)
    return result
  }

  /**
   * Sequential matrix multiplication fallback
   */
  private static multiplySequential(
    aData: number[] | Float64Array,
    aRows: number,
    aCols: number,
    bData: number[] | Float64Array,
    bRows: number,
    bCols: number
  ): Float64Array {
    const result = new Float64Array(aRows * bCols)

    for (let i = 0; i < aRows; i++) {
      for (let j = 0; j < bCols; j++) {
        let sum = 0
        for (let k = 0; k < aCols; k++) {
          sum += aData[i * aCols + k] * bData[k * bCols + j]
        }
        result[i * bCols + j] = sum
      }
    }

    return result
  }

  /**
   * Parallel matrix addition: C = A + B
   */
  public static async add(
    aData: number[] | Float64Array,
    bData: number[] | Float64Array,
    size: number
  ): Promise<Float64Array> {
    if (!this.shouldUseParallel(size)) {
      const result = new Float64Array(size)
      for (let i = 0; i < size; i++) {
        result[i] = aData[i] + bData[i]
      }
      return result
    }

    const pool = this.getWorkerPool()
    const workerCount = pool.workerCount
    const chunkSize = Math.ceil(size / workerCount)

    const aShared = this.toSharedBuffer(aData)
    const bShared = this.toSharedBuffer(bData)
    const resultBuffer = this.config.useSharedMemory
      ? new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
      : new ArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const result = new Float64Array(resultBuffer)

    const tasks: Promise<void>[] = []
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      if (start >= size) break

      const task = pool.execute({
        operation: 'add',
        aData: aShared,
        bData: bShared,
        start,
        end,
        resultData: result
      })

      tasks.push(task)
    }

    await Promise.all(tasks)
    return result
  }

  /**
   * Parallel matrix transpose: B = A^T
   */
  public static async transpose(
    data: number[] | Float64Array,
    rows: number,
    cols: number
  ): Promise<Float64Array> {
    const totalSize = rows * cols

    if (!this.shouldUseParallel(totalSize)) {
      const result = new Float64Array(totalSize)
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          result[j * rows + i] = data[i * cols + j]
        }
      }
      return result
    }

    const pool = this.getWorkerPool()
    const workerCount = pool.workerCount
    const rowsPerWorker = Math.ceil(rows / workerCount)

    const dataShared = this.toSharedBuffer(data)
    const resultBuffer = this.config.useSharedMemory
      ? new SharedArrayBuffer(totalSize * Float64Array.BYTES_PER_ELEMENT)
      : new ArrayBuffer(totalSize * Float64Array.BYTES_PER_ELEMENT)
    const result = new Float64Array(resultBuffer)

    const tasks: Promise<void>[] = []
    for (let i = 0; i < workerCount; i++) {
      const startRow = i * rowsPerWorker
      const endRow = Math.min(startRow + rowsPerWorker, rows)

      if (startRow >= rows) break

      const task = pool.execute({
        operation: 'transpose',
        data: dataShared,
        rows,
        cols,
        startRow,
        endRow,
        resultData: result
      })

      tasks.push(task)
    }

    await Promise.all(tasks)
    return result
  }

  /**
   * Terminate the worker pool (cleanup)
   */
  public static async terminate(): Promise<void> {
    if (this.workerPool) {
      await this.workerPool.terminate()
      this.workerPool = null
    }
  }
}
