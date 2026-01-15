/**
 * WASM Worker - WebWorker for WASM-accelerated math operations
 *
 * This worker loads the WASM module and executes operations using WASM
 * for maximum performance. Falls back to JS if WASM is not available.
 */

import workerpool from '@danielsimonjr/workerpool'

// WASM module instance
let wasmModule: any = null
const wasmSimdModule: any = null
let initialized = false

/**
 * Initialize WASM modules
 */
async function initWasm(wasmPath?: string): Promise<boolean> {
  if (initialized) return wasmModule !== null

  try {
    // Try to load the WASM module
    const path = wasmPath || './mathjs.wasm'

    if (typeof WebAssembly !== 'undefined') {
      const response = await fetch(path)
      const buffer = await response.arrayBuffer()
      const module = await WebAssembly.compile(buffer)
      wasmModule = await WebAssembly.instantiate(module)
    }

    initialized = true
    return wasmModule !== null
  } catch (e) {
    console.warn('WASM initialization failed:', e)
    initialized = true
    return false
  }
}

// ============================================================================
// WASM-ACCELERATED OPERATIONS
// ============================================================================

/**
 * Matrix multiplication using WASM
 */
function matrixMultiply(
  a: number[],
  aRows: number,
  aCols: number,
  b: number[],
  bRows: number,
  bCols: number
): number[] {
  // Use WASM if available
  if (wasmModule?.exports?.matrixMultiply) {
    const aTyped = new Float64Array(a)
    const bTyped = new Float64Array(b)
    const resultTyped = new Float64Array(aRows * bCols)

    wasmModule.exports.matrixMultiply(
      aTyped,
      aRows,
      aCols,
      bTyped,
      bRows,
      bCols,
      resultTyped
    )

    return Array.from(resultTyped)
  }

  // JS fallback
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
}

/**
 * Dot product using WASM
 */
function dotProduct(a: number[], b: number[]): number {
  if (wasmModule?.exports?.dotProduct) {
    const aTyped = new Float64Array(a)
    const bTyped = new Float64Array(b)
    return wasmModule.exports.dotProduct(aTyped, bTyped, a.length)
  }

  // JS fallback
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

/**
 * Vector addition using WASM
 */
function vectorAdd(a: number[], b: number[]): number[] {
  if (wasmModule?.exports?.simdAddF64) {
    const aTyped = new Float64Array(a)
    const bTyped = new Float64Array(b)
    const resultTyped = new Float64Array(a.length)
    wasmModule.exports.simdAddF64(aTyped, bTyped, resultTyped, a.length)
    return Array.from(resultTyped)
  }

  // JS fallback
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

/**
 * Vector multiplication using WASM
 */
function vectorMultiply(a: number[], b: number[]): number[] {
  if (wasmModule?.exports?.simdMulF64) {
    const aTyped = new Float64Array(a)
    const bTyped = new Float64Array(b)
    const resultTyped = new Float64Array(a.length)
    wasmModule.exports.simdMulF64(aTyped, bTyped, resultTyped, a.length)
    return Array.from(resultTyped)
  }

  // JS fallback
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] * b[i]
  }
  return result
}

/**
 * Sum of array elements using WASM
 */
function sum(arr: number[]): number {
  if (wasmModule?.exports?.simdSumF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdSumF64(typed, arr.length)
  }

  // JS fallback
  let result = 0
  for (let i = 0; i < arr.length; i++) {
    result += arr[i]
  }
  return result
}

/**
 * Mean of array elements using WASM
 */
function mean(arr: number[]): number {
  if (wasmModule?.exports?.simdMeanF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdMeanF64(typed, arr.length)
  }

  // JS fallback
  return sum(arr) / arr.length
}

/**
 * Variance of array elements using WASM
 */
function variance(arr: number[], ddof: number = 0): number {
  if (wasmModule?.exports?.simdVarianceF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdVarianceF64(typed, arr.length, ddof)
  }

  // JS fallback
  const m = mean(arr)
  let sumSq = 0
  for (let i = 0; i < arr.length; i++) {
    const diff = arr[i] - m
    sumSq += diff * diff
  }
  return sumSq / (arr.length - ddof)
}

/**
 * Standard deviation using WASM
 */
function std(arr: number[], ddof: number = 0): number {
  if (wasmModule?.exports?.simdStdF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdStdF64(typed, arr.length, ddof)
  }

  return Math.sqrt(variance(arr, ddof))
}

/**
 * L2 norm (Euclidean) using WASM
 */
function norm(arr: number[]): number {
  if (wasmModule?.exports?.simdNormF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdNormF64(typed, arr.length)
  }

  // JS fallback
  let sumSq = 0
  for (let i = 0; i < arr.length; i++) {
    sumSq += arr[i] * arr[i]
  }
  return Math.sqrt(sumSq)
}

/**
 * Min of array elements using WASM
 */
function min(arr: number[]): number {
  if (wasmModule?.exports?.simdMinF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdMinF64(typed, arr.length)
  }

  // JS fallback
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < result) result = arr[i]
  }
  return result
}

/**
 * Max of array elements using WASM
 */
function max(arr: number[]): number {
  if (wasmModule?.exports?.simdMaxF64) {
    const typed = new Float64Array(arr)
    return wasmModule.exports.simdMaxF64(typed, arr.length)
  }

  // JS fallback
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > result) result = arr[i]
  }
  return result
}

/**
 * FFT using WASM
 */
function fft(
  real: number[],
  imag: number[]
): { real: number[]; imag: number[] } {
  if (wasmModule?.exports?.fft) {
    const realTyped = new Float64Array(real)
    const imagTyped = new Float64Array(imag)
    wasmModule.exports.fft(realTyped, imagTyped, real.length)
    return {
      real: Array.from(realTyped),
      imag: Array.from(imagTyped)
    }
  }

  // JS fallback - Cooley-Tukey FFT
  const n = real.length
  if (n <= 1) return { real, imag }

  // Bit-reversal permutation
  const realOut = [...real]
  const imagOut = [...imag]

  let j = 0
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      ;[realOut[i], realOut[j]] = [realOut[j], realOut[i]]
      ;[imagOut[i], imagOut[j]] = [imagOut[j], imagOut[i]]
    }
    let k = n >> 1
    while (k <= j) {
      j -= k
      k >>= 1
    }
    j += k
  }

  // Cooley-Tukey iterative FFT
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1
    const angle = (-2 * Math.PI) / len
    const wReal = Math.cos(angle)
    const wImag = Math.sin(angle)

    for (let i = 0; i < n; i += len) {
      let wpReal = 1
      let wpImag = 0

      for (let k = 0; k < halfLen; k++) {
        const idx1 = i + k
        const idx2 = i + k + halfLen

        const tReal = wpReal * realOut[idx2] - wpImag * imagOut[idx2]
        const tImag = wpReal * imagOut[idx2] + wpImag * realOut[idx2]

        realOut[idx2] = realOut[idx1] - tReal
        imagOut[idx2] = imagOut[idx1] - tImag
        realOut[idx1] += tReal
        imagOut[idx1] += tImag

        const temp = wpReal
        wpReal = wpReal * wReal - wpImag * wImag
        wpImag = temp * wImag + wpImag * wReal
      }
    }
  }

  return { real: realOut, imag: imagOut }
}

/**
 * Matrix-vector multiplication using WASM
 */
function matVecMul(
  matrix: number[],
  vector: number[],
  rows: number,
  cols: number
): number[] {
  if (wasmModule?.exports?.simdMatVecMulF64) {
    const matrixTyped = new Float64Array(matrix)
    const vectorTyped = new Float64Array(vector)
    const resultTyped = new Float64Array(rows)
    wasmModule.exports.simdMatVecMulF64(
      matrixTyped,
      vectorTyped,
      resultTyped,
      rows,
      cols
    )
    return Array.from(resultTyped)
  }

  // JS fallback
  const result = new Array(rows).fill(0)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i] += matrix[i * cols + j] * vector[j]
    }
  }
  return result
}

/**
 * Chunk processor for parallel operations
 */
function processChunk(
  data: number[],
  operation: string,
  start: number,
  end: number
): number {
  const chunk = data.slice(start, end)

  switch (operation) {
    case 'sum':
      return sum(chunk)
    case 'mean':
      return mean(chunk)
    case 'min':
      return min(chunk)
    case 'max':
      return max(chunk)
    case 'norm':
      return norm(chunk)
    default:
      return 0
  }
}

/**
 * Check if WASM is available
 */
function isWasmAvailable(): boolean {
  return wasmModule !== null
}

/**
 * Check if SIMD is available
 */
function isSimdAvailable(): boolean {
  return wasmSimdModule !== null
}

// Register worker methods
workerpool.worker({
  initWasm,
  matrixMultiply,
  dotProduct,
  vectorAdd,
  vectorMultiply,
  sum,
  mean,
  variance,
  std,
  norm,
  min,
  max,
  fft,
  matVecMul,
  processChunk,
  isWasmAvailable,
  isSimdAvailable
} as Record<string, (...args: any[]) => any>)
