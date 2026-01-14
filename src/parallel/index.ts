/**
 * Parallel Computing Module
 *
 * Provides multi-core parallel processing capabilities for math.js
 * using @danielsimonjr/workerpool for cross-platform worker management.
 *
 * Features:
 * - Automatic worker pool management
 * - SharedArrayBuffer support for zero-copy data transfer
 * - Automatic fallback to sequential processing for small datasets
 * - Cross-platform support (Node.js and browsers)
 * - WASM acceleration support
 * - SIMD optimization support
 */

// Core worker pool implementation
export {
  MathWorkerPool,
  WorkerPool, // Legacy alias
  WorkerPoolOptions,
  PoolStats,
  createMathWorker,
  workerpool
} from './WorkerPool.ts'

// WASM-accelerated worker pool
export {
  WasmWorkerPool,
  WasmWorkerPoolOptions,
  ExecutionMode,
  BenchmarkResult,
  createMatrixPool,
  createStatsPool
} from './WasmWorkerPool.ts'

// Parallel matrix operations
export { ParallelMatrix, MatrixData, ParallelConfig } from './ParallelMatrix.ts'

// Re-export types for convenience
export type { WorkerPoolOptions as PoolOptions } from './WorkerPool.ts'
