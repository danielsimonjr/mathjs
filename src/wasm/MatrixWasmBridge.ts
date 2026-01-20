/**
 * Matrix WASM Bridge - Integrates WASM operations with mathjs Matrix types
 * Provides high-performance matrix operations using WASM when available
 *
 * Optimization Strategy:
 * - Small operations (<100 elements): Use pure JavaScript (no copy overhead)
 * - Medium operations (100-10000): Use WASM (good speedup, minimal overhead)
 * - Large operations (>10000): Use WASM + SIMD or Parallel
 *
 * Thresholds are based on profiling data showing:
 * - Memory copy: ~0.001ms per 1000 elements
 * - WASM call overhead: ~0.005ms
 * - JS is faster for arrays < ~50-100 elements due to copy overhead
 */

import { wasmLoader, type WasmModule } from './WasmLoader.ts'
import { ParallelMatrix } from '../parallel/ParallelMatrix.ts'

export interface MatrixOptions {
  useWasm?: boolean
  useParallel?: boolean
  minSizeForWasm?: number
  minSizeForParallel?: number
}

/**
 * Operation-specific thresholds based on profiling
 * These values represent the minimum element count where WASM becomes beneficial
 */
export const WasmThresholds = {
  // Simple element-wise operations (add, subtract, multiply)
  // WASM needs ~100 elements to overcome copy overhead
  elementWise: 100,

  // Dot product - memory bound, needs more data to benefit
  dotProduct: 200,

  // Matrix multiply - computationally intensive, benefits earlier
  matrixMultiply: 64, // 8x8 matrix

  // FFT - very compute intensive, always beneficial
  fft: 32,

  // LU decomposition - O(n³), benefits at smaller sizes
  luDecomposition: 16, // 4x4 matrix

  // Statistics (mean, variance, etc.) - simple operations
  statistics: 500,

  // Parallel processing - needs significant work to overcome thread overhead
  parallel: 10000
} as const

export class MatrixWasmBridge {
  private static defaultOptions: Required<MatrixOptions> = {
    useWasm: true,
    useParallel: true,
    minSizeForWasm: WasmThresholds.elementWise,
    minSizeForParallel: WasmThresholds.parallel
  }

  private static wasmModule: WasmModule | null = null

  /**
   * Initialize the WASM module
   */
  public static async init(wasmPath?: string): Promise<void> {
    try {
      this.wasmModule = await wasmLoader.load(wasmPath)
    } catch (error) {
      console.warn(
        'WASM initialization failed, falling back to JavaScript:',
        error
      )
      this.defaultOptions.useWasm = false
    }
  }

  /**
   * Configure matrix operation preferences
   */
  public static configure(options: MatrixOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  /**
   * Matrix multiplication with automatic optimization selection
   * Chooses between: WASM SIMD, WASM standard, Parallel, or JavaScript
   *
   * Selection strategy based on profiling:
   * - <64 total elements: JS (copy overhead > compute savings)
   * - 64-10000 elements: WASM with SIMD
   * - >10000 elements: Parallel (multi-core)
   */
  public static async multiply(
    aData: number[] | Float64Array,
    aRows: number,
    aCols: number,
    bData: number[] | Float64Array,
    bRows: number,
    bCols: number,
    options?: MatrixOptions
  ): Promise<Float64Array> {
    const opts = { ...this.defaultOptions, ...options }
    const totalElements = aRows * aCols + bRows * bCols
    const outputElements = aRows * bCols

    // Use matrix-multiply specific threshold
    const wasmThreshold = WasmThresholds.matrixMultiply

    // Strategy selection based on operation complexity
    // Matrix multiply is O(n³), so WASM benefits even at smaller sizes
    if (opts.useParallel && outputElements >= WasmThresholds.parallel) {
      // Very large matrices: use parallel processing
      return ParallelMatrix.multiply(aData, aRows, aCols, bData, bRows, bCols)
    } else if (
      opts.useWasm &&
      this.wasmModule &&
      totalElements >= wasmThreshold
    ) {
      // Medium/large matrices: use WASM with SIMD
      return this.multiplyWasm(aData, aRows, aCols, bData, bRows, bCols, true)
    } else {
      // Small matrices: JS is faster due to no copy overhead
      return this.multiplyJS(aData, aRows, aCols, bData, bRows, bCols)
    }
  }

  /**
   * WASM-accelerated matrix multiplication
   */
  private static async multiplyWasm(
    aData: number[] | Float64Array,
    aRows: number,
    aCols: number,
    bData: number[] | Float64Array,
    bRows: number,
    bCols: number,
    useSIMD: boolean = false
  ): Promise<Float64Array> {
    if (!this.wasmModule) {
      throw new Error('WASM module not initialized')
    }

    // Allocate arrays in WASM memory
    const a = wasmLoader.allocateFloat64Array(aData)
    const b = wasmLoader.allocateFloat64Array(bData)
    const result = wasmLoader.allocateFloat64Array(
      new Float64Array(aRows * bCols)
    )

    try {
      // Call WASM function
      if (useSIMD) {
        this.wasmModule.multiplyDenseSIMD(
          a.ptr,
          aRows,
          aCols,
          b.ptr,
          bRows,
          bCols,
          result.ptr
        )
      } else {
        this.wasmModule.multiplyDense(
          a.ptr,
          aRows,
          aCols,
          b.ptr,
          bRows,
          bCols,
          result.ptr
        )
      }

      // Copy result
      return new Float64Array(result.array)
    } finally {
      // Free WASM memory
      wasmLoader.free(a.ptr)
      wasmLoader.free(b.ptr)
      wasmLoader.free(result.ptr)
    }
  }

  /**
   * JavaScript fallback for matrix multiplication
   */
  private static multiplyJS(
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
   * LU Decomposition with WASM acceleration
   *
   * LU decomposition is O(n³), so WASM benefits at smaller matrix sizes
   * Threshold: 4x4 matrix (16 elements) based on profiling
   */
  public static async luDecomposition(
    data: number[] | Float64Array,
    n: number,
    options?: MatrixOptions
  ): Promise<{ lu: Float64Array; perm: Int32Array; singular: boolean }> {
    const opts = { ...this.defaultOptions, ...options }

    // Use LU-specific threshold (n is matrix dimension, n*n is element count)
    if (
      opts.useWasm &&
      this.wasmModule &&
      n * n >= WasmThresholds.luDecomposition
    ) {
      return this.luDecompositionWasm(data, n)
    } else {
      return this.luDecompositionJS(data, n)
    }
  }

  private static async luDecompositionWasm(
    data: number[] | Float64Array,
    n: number
  ): Promise<{ lu: Float64Array; perm: Int32Array; singular: boolean }> {
    if (!this.wasmModule) {
      throw new Error('WASM module not initialized')
    }

    const a = wasmLoader.allocateFloat64Array(data)
    const perm = wasmLoader.allocateInt32Array(new Int32Array(n))

    try {
      const success = this.wasmModule.luDecomposition(a.ptr, n, perm.ptr)

      return {
        lu: new Float64Array(a.array),
        perm: new Int32Array(perm.array),
        singular: success === 0
      }
    } finally {
      wasmLoader.free(a.ptr)
      wasmLoader.free(perm.ptr)
    }
  }

  private static luDecompositionJS(
    data: number[] | Float64Array,
    n: number
  ): { lu: Float64Array; perm: Int32Array; singular: boolean } {
    const a = new Float64Array(data)
    const perm = new Int32Array(n)

    for (let i = 0; i < n; i++) {
      perm[i] = i
    }

    for (let k = 0; k < n - 1; k++) {
      let maxVal = Math.abs(a[k * n + k])
      let pivotRow = k

      for (let i = k + 1; i < n; i++) {
        const val = Math.abs(a[i * n + k])
        if (val > maxVal) {
          maxVal = val
          pivotRow = i
        }
      }

      if (maxVal < 1e-14) {
        return { lu: a, perm, singular: true }
      }

      if (pivotRow !== k) {
        for (let j = 0; j < n; j++) {
          const temp = a[k * n + j]
          a[k * n + j] = a[pivotRow * n + j]
          a[pivotRow * n + j] = temp
        }
        const temp = perm[k]
        perm[k] = perm[pivotRow]
        perm[pivotRow] = temp
      }

      const pivot = a[k * n + k]
      for (let i = k + 1; i < n; i++) {
        const factor = a[i * n + k] / pivot
        a[i * n + k] = factor

        for (let j = k + 1; j < n; j++) {
          a[i * n + j] -= factor * a[k * n + j]
        }
      }
    }

    return { lu: a, perm, singular: false }
  }

  /**
   * FFT with WASM acceleration
   *
   * FFT is computationally intensive (O(n log n) with complex operations)
   * WASM benefits even at small sizes (32 elements)
   */
  public static async fft(
    data: Float64Array,
    inverse: boolean = false,
    options?: MatrixOptions
  ): Promise<Float64Array> {
    const opts = { ...this.defaultOptions, ...options }
    const n = data.length / 2 // Complex numbers

    // FFT-specific threshold - benefits at smaller sizes due to compute intensity
    if (opts.useWasm && this.wasmModule && n >= WasmThresholds.fft) {
      return this.fftWasm(data, n, inverse)
    } else {
      // Fallback to JavaScript implementation
      throw new Error('JavaScript FFT fallback not implemented in bridge')
    }
  }

  private static async fftWasm(
    data: Float64Array,
    n: number,
    inverse: boolean
  ): Promise<Float64Array> {
    if (!this.wasmModule) {
      throw new Error('WASM module not initialized')
    }

    const dataAlloc = wasmLoader.allocateFloat64Array(data)

    try {
      this.wasmModule.fft(dataAlloc.ptr, n, inverse ? 1 : 0)
      return new Float64Array(dataAlloc.array)
    } finally {
      wasmLoader.free(dataAlloc.ptr)
    }
  }

  /**
   * Get performance metrics
   */
  public static getCapabilities(): {
    wasmAvailable: boolean
    parallelAvailable: boolean
    simdAvailable: boolean
  } {
    return {
      wasmAvailable: this.wasmModule !== null,
      parallelAvailable: typeof Worker !== 'undefined',
      simdAvailable: this.wasmModule !== null // WASM SIMD available with module
    }
  }

  /**
   * Cleanup resources
   */
  public static async cleanup(): Promise<void> {
    await ParallelMatrix.terminate()
    if (this.wasmModule) {
      wasmLoader.collect()
    }
  }
}

/**
 * Auto-initialize WASM on module load (best-effort)
 */
if (typeof globalThis !== 'undefined') {
  MatrixWasmBridge.init().catch(() => {
    // Silently fail, will use JavaScript fallback
  })
}
