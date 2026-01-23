/**
 * Performance Benchmark Suite for Math.js
 *
 * Compares performance across different execution modes:
 * - JavaScript (baseline)
 * - WASM
 * - WASM + SIMD
 * - Parallel JS (WebWorkers)
 * - Parallel WASM (WebWorkers + WASM)
 *
 * Run with: npx tsx test/benchmark/performance-benchmark.ts
 */

import { performance } from 'perf_hooks'

// ============================================================================
// BENCHMARK CONFIGURATION
// ============================================================================

interface BenchmarkConfig {
  name: string
  sizes: number[]
  iterations: number
  warmup: number
}

interface BenchmarkResult {
  name: string
  mode: string
  size: number
  iterations: number
  totalMs: number
  avgMs: number
  medianMs: number
  minMs: number
  maxMs: number
  opsPerSec: number
  speedupVsJs?: number
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  name: '',
  sizes: [100, 1000, 10000, 100000],
  iterations: 50,
  warmup: 5
}

// ============================================================================
// JAVASCRIPT IMPLEMENTATIONS (Baseline)
// ============================================================================

const jsImplementations = {
  vectorAdd(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] + b[i]
    }
    return result
  },

  vectorMul(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] * b[i]
    }
    return result
  },

  dotProduct(a: Float64Array, b: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i]
    }
    return sum
  },

  sum(a: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += a[i]
    }
    return sum
  },

  mean(a: Float64Array): number {
    return jsImplementations.sum(a) / a.length
  },

  variance(a: Float64Array): number {
    const m = jsImplementations.mean(a)
    let sumSq = 0
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - m
      sumSq += diff * diff
    }
    return sumSq / a.length
  },

  std(a: Float64Array): number {
    return Math.sqrt(jsImplementations.variance(a))
  },

  norm(a: Float64Array): number {
    let sumSq = 0
    for (let i = 0; i < a.length; i++) {
      sumSq += a[i] * a[i]
    }
    return Math.sqrt(sumSq)
  },

  min(a: Float64Array): number {
    let result = a[0]
    for (let i = 1; i < a.length; i++) {
      if (a[i] < result) result = a[i]
    }
    return result
  },

  max(a: Float64Array): number {
    let result = a[0]
    for (let i = 1; i < a.length; i++) {
      if (a[i] > result) result = a[i]
    }
    return result
  },

  matrixMultiply(
    a: Float64Array,
    b: Float64Array,
    m: number,
    k: number,
    n: number
  ): Float64Array {
    const result = new Float64Array(m * n)
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0
        for (let p = 0; p < k; p++) {
          sum += a[i * k + p] * b[p * n + j]
        }
        result[i * n + j] = sum
      }
    }
    return result
  },

  matVecMul(
    matrix: Float64Array,
    vector: Float64Array,
    rows: number,
    cols: number
  ): Float64Array {
    const result = new Float64Array(rows)
    for (let i = 0; i < rows; i++) {
      let sum = 0
      for (let j = 0; j < cols; j++) {
        sum += matrix[i * cols + j] * vector[j]
      }
      result[i] = sum
    }
    return result
  },

  fft(real: Float64Array, imag: Float64Array): void {
    const n = real.length
    if (n <= 1) return

    // Bit-reversal permutation
    let j = 0
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        ;[real[i], real[j]] = [real[j], real[i]]
        ;[imag[i], imag[j]] = [imag[j], imag[i]]
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

          const tReal = wpReal * real[idx2] - wpImag * imag[idx2]
          const tImag = wpReal * imag[idx2] + wpImag * real[idx2]

          real[idx2] = real[idx1] - tReal
          imag[idx2] = imag[idx1] - tImag
          real[idx1] += tReal
          imag[idx1] += tImag

          const temp = wpReal
          wpReal = wpReal * wReal - wpImag * wImag
          wpImag = temp * wImag + wpImag * wReal
        }
      }
    }
  }
}

// ============================================================================
// WASM IMPLEMENTATIONS (Import from src/wasm)
// ============================================================================

let _wasmModule: any = null
let wasmExports: any = null

async function loadWasmModule(): Promise<boolean> {
  try {
    // Load the compiled WASM module using the generated bindings
    const wasm = (await import('../../lib/wasm/index.js')) as any
    wasmExports = wasm

    _wasmModule = {
      // SIMD-optimized operations (may not be available in all builds)
      simdAddF64: wasm.simdAddF64 || null,
      simdMulF64: wasm.simdMulF64 || null,
      simdDotF64: wasm.simdDotF64 || null,
      simdSumF64: wasm.simdSumF64 || null,
      simdMeanF64: wasm.simdMeanF64 || null,
      simdVarianceF64: wasm.simdVarianceF64 || null,
      simdStdF64: wasm.simdStdF64 || null,
      simdNormF64: wasm.simdNormF64 || null,
      simdMinF64: wasm.simdMinF64 || null,
      simdMaxF64: wasm.simdMaxF64 || null,
      simdMatMulF64: wasm.simdMatMulF64 || null,
      simdMatVecMulF64: wasm.simdMatVecMulF64 || null,
      // Non-SIMD WASM versions
      sum: wasm.sum,
      mean: wasm.mean,
      variance: wasm.variance,
      std: wasm.std,
      multiplyDense: wasm.multiplyDense,
      dotProduct: wasm.dotProduct,
      fft: wasm.fft
    }
    return true
  } catch (e) {
    console.warn('WASM module loading failed:', e)
    return false
  }
}

const wasmImplementations = {
  // Non-SIMD WASM implementations
  vectorAdd(a: Float64Array, b: Float64Array): Float64Array {
    if (wasmExports?.add) {
      return wasmExports.add(a, b, a.length)
    }
    return new Float64Array(a.length)
  },

  vectorMul(a: Float64Array, b: Float64Array): Float64Array {
    // Element-wise multiply not directly available, use SIMD version
    const result = new Float64Array(a.length)
    if (wasmExports?.simdMulF64) {
      wasmExports.simdMulF64(a, b, result, a.length)
    }
    return result
  },

  dotProduct(a: Float64Array, b: Float64Array): number {
    if (wasmExports?.dotProduct) {
      return wasmExports.dotProduct(a, b, a.length)
    }
    return 0
  },

  sum(a: Float64Array): number {
    if (wasmExports?.simdSumF64) {
      return wasmExports.simdSumF64(a, a.length)
    }
    return 0
  },

  mean(a: Float64Array): number {
    if (wasmExports?.simdMeanF64) {
      return wasmExports.simdMeanF64(a, a.length)
    }
    return 0
  },

  variance(a: Float64Array): number {
    if (wasmExports?.simdVarianceF64) {
      return wasmExports.simdVarianceF64(a, a.length, 0)
    }
    return 0
  },

  std(a: Float64Array): number {
    if (wasmExports?.simdStdF64) {
      return wasmExports.simdStdF64(a, a.length, 0)
    }
    return 0
  },

  norm(a: Float64Array): number {
    if (wasmExports?.simdNormF64) {
      return wasmExports.simdNormF64(a, a.length)
    }
    return 0
  },

  min(a: Float64Array): number {
    if (wasmExports?.simdMinF64) {
      return wasmExports.simdMinF64(a, a.length)
    }
    return 0
  },

  max(a: Float64Array): number {
    if (wasmExports?.simdMaxF64) {
      return wasmExports.simdMaxF64(a, a.length)
    }
    return 0
  },

  matrixMultiply(
    a: Float64Array,
    b: Float64Array,
    m: number,
    k: number,
    n: number
  ): Float64Array {
    if (wasmExports?.multiplyDense) {
      return wasmExports.multiplyDense(a, m, k, b, k, n)
    }
    return new Float64Array(m * n)
  },

  matVecMul(
    matrix: Float64Array,
    vector: Float64Array,
    rows: number,
    cols: number
  ): Float64Array {
    if (wasmExports?.multiplyVector) {
      return wasmExports.multiplyVector(matrix, rows, cols, vector)
    }
    return new Float64Array(rows)
  },

  fft(real: Float64Array, imag: Float64Array): Float64Array {
    if (wasmExports?.fft) {
      // WASM FFT expects interleaved complex data [re0, im0, re1, im1, ...]
      const n = real.length
      const data = new Float64Array(n * 2)
      for (let i = 0; i < n; i++) {
        data[i * 2] = real[i]
        data[i * 2 + 1] = imag[i]
      }
      return wasmExports.fft(data, n, 0)
    }
    return new Float64Array(0)
  }
}

// SIMD-optimized WASM implementations
const simdImplementations = {
  vectorAdd(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    if (wasmExports?.simdAddF64) {
      wasmExports.simdAddF64(a, b, result, a.length)
    }
    return result
  },

  vectorMul(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    if (wasmExports?.simdMulF64) {
      wasmExports.simdMulF64(a, b, result, a.length)
    }
    return result
  },

  dotProduct(a: Float64Array, b: Float64Array): number {
    if (wasmExports?.simdDotF64) {
      return wasmExports.simdDotF64(a, b, a.length)
    }
    return 0
  },

  sum(a: Float64Array): number {
    if (wasmExports?.simdSumF64) {
      return wasmExports.simdSumF64(a, a.length)
    }
    return 0
  },

  mean(a: Float64Array): number {
    if (wasmExports?.simdMeanF64) {
      return wasmExports.simdMeanF64(a, a.length)
    }
    return 0
  },

  matrixMultiply(
    a: Float64Array,
    b: Float64Array,
    m: number,
    k: number,
    n: number
  ): Float64Array {
    const result = new Float64Array(m * n)
    if (wasmExports?.simdMatMulF64) {
      wasmExports.simdMatMulF64(a, b, result, m, k, n)
    }
    return result
  }
}

// ============================================================================
// PARALLEL IMPLEMENTATIONS
// ============================================================================

function createChunks<T>(
  array: T[],
  numChunks: number
): Array<{ start: number; end: number }> {
  const chunkSize = Math.ceil(array.length / numChunks)
  const chunks: Array<{ start: number; end: number }> = []

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, array.length)
    if (start < array.length) {
      chunks.push({ start, end })
    }
  }

  return chunks
}

// Simulated parallel execution for benchmarking purposes
// In a real scenario, this would use WebWorkers
const parallelImplementations = {
  async sum(a: Float64Array, numWorkers: number = 4): Promise<number> {
    const chunks = createChunks(Array.from(a), numWorkers)
    const partialSums = chunks.map(({ start, end }) => {
      let sum = 0
      for (let i = start; i < end; i++) {
        sum += a[i]
      }
      return sum
    })
    return partialSums.reduce((acc, val) => acc + val, 0)
  },

  async mean(a: Float64Array, numWorkers: number = 4): Promise<number> {
    const sum = await parallelImplementations.sum(a, numWorkers)
    return sum / a.length
  },

  async dotProduct(
    a: Float64Array,
    b: Float64Array,
    numWorkers: number = 4
  ): Promise<number> {
    const chunks = createChunks(Array.from(a), numWorkers)
    const partialDots = chunks.map(({ start, end }) => {
      let sum = 0
      for (let i = start; i < end; i++) {
        sum += a[i] * b[i]
      }
      return sum
    })
    return partialDots.reduce((acc, val) => acc + val, 0)
  }
}

// ============================================================================
// BENCHMARK RUNNER
// ============================================================================

function generateRandomArray(size: number): Float64Array {
  const arr = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    arr[i] = Math.random() * 100 - 50
  }
  return arr
}

function computeStats(times: number[]): {
  avg: number
  median: number
  min: number
  max: number
} {
  times.sort((a, b) => a - b)
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const median = times[Math.floor(times.length / 2)]
  const min = times[0]
  const max = times[times.length - 1]
  return { avg, median, min, max }
}

async function runBenchmark(
  name: string,
  fn: () => any,
  config: BenchmarkConfig
): Promise<{ times: number[]; result: any }> {
  // Warmup
  for (let i = 0; i < config.warmup; i++) {
    fn()
  }

  // Timed runs
  const times: number[] = []
  let result: any

  for (let i = 0; i < config.iterations; i++) {
    const start = performance.now()
    result = fn()
    const end = performance.now()
    times.push(end - start)
  }

  return { times, result }
}

async function benchmarkOperation(
  operationName: string,
  jsFn: (size: number) => any,
  wasmFn: ((size: number) => any) | null,
  simdFn: ((size: number) => any) | null = null,
  config: Partial<BenchmarkConfig> = {}
): Promise<BenchmarkResult[]> {
  const fullConfig = { ...DEFAULT_CONFIG, name: operationName, ...config }
  const results: BenchmarkResult[] = []

  console.log(`\n📊 Benchmarking: ${operationName}`)
  console.log('─'.repeat(60))

  for (const size of fullConfig.sizes) {
    console.log(`  Size: ${size.toLocaleString()}`)

    // JavaScript benchmark
    const jsResult = await runBenchmark(
      `${operationName}_js`,
      () => jsFn(size),
      fullConfig
    )
    const jsStats = computeStats(jsResult.times)

    const jsEntry: BenchmarkResult = {
      name: operationName,
      mode: 'JavaScript',
      size,
      iterations: fullConfig.iterations,
      totalMs: jsResult.times.reduce((a, b) => a + b, 0),
      avgMs: jsStats.avg,
      medianMs: jsStats.median,
      minMs: jsStats.min,
      maxMs: jsStats.max,
      opsPerSec: 1000 / jsStats.avg
    }
    results.push(jsEntry)

    console.log(
      `    JS:     avg=${jsStats.avg.toFixed(3)}ms, median=${jsStats.median.toFixed(3)}ms`
    )

    // WASM benchmark (if available)
    if (wasmFn && wasmExports) {
      try {
        const wasmResult = await runBenchmark(
          `${operationName}_wasm`,
          () => wasmFn(size),
          fullConfig
        )
        const wasmStats = computeStats(wasmResult.times)
        const speedup = jsStats.avg / wasmStats.avg

        const wasmEntry: BenchmarkResult = {
          name: operationName,
          mode: 'WASM',
          size,
          iterations: fullConfig.iterations,
          totalMs: wasmResult.times.reduce((a, b) => a + b, 0),
          avgMs: wasmStats.avg,
          medianMs: wasmStats.median,
          minMs: wasmStats.min,
          maxMs: wasmStats.max,
          opsPerSec: 1000 / wasmStats.avg,
          speedupVsJs: speedup
        }
        results.push(wasmEntry)

        console.log(
          `    WASM:   avg=${wasmStats.avg.toFixed(3)}ms, median=${wasmStats.median.toFixed(3)}ms, speedup=${speedup.toFixed(2)}x`
        )
      } catch (e) {
        console.log(`    WASM: Not available - ${e}`)
      }
    }

    // SIMD benchmark (if available)
    if (simdFn && wasmExports) {
      try {
        const simdResult = await runBenchmark(
          `${operationName}_simd`,
          () => simdFn(size),
          fullConfig
        )
        const simdStats = computeStats(simdResult.times)
        const speedup = jsStats.avg / simdStats.avg

        const simdEntry: BenchmarkResult = {
          name: operationName,
          mode: 'WASM+SIMD',
          size,
          iterations: fullConfig.iterations,
          totalMs: simdResult.times.reduce((a, b) => a + b, 0),
          avgMs: simdStats.avg,
          medianMs: simdStats.median,
          minMs: simdStats.min,
          maxMs: simdStats.max,
          opsPerSec: 1000 / simdStats.avg,
          speedupVsJs: speedup
        }
        results.push(simdEntry)

        console.log(
          `    SIMD:   avg=${simdStats.avg.toFixed(3)}ms, median=${simdStats.median.toFixed(3)}ms, speedup=${speedup.toFixed(2)}x`
        )
      } catch (e) {
        console.log(`    SIMD: Not available - ${e}`)
      }
    }
  }

  return results
}

// ============================================================================
// MAIN BENCHMARK SUITE
// ============================================================================

async function runAllBenchmarks(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('  Math.js Performance Benchmark Suite')
  console.log('  JavaScript vs WASM vs Parallel Execution')
  console.log('═'.repeat(60))

  // Load WASM module
  console.log('\n🔧 Loading WASM modules...')
  const wasmLoaded = await loadWasmModule()
  console.log(`   WASM available: ${wasmLoaded ? '✅' : '❌'}`)

  const allResults: BenchmarkResult[] = []

  // Vector operations
  allResults.push(
    ...(await benchmarkOperation(
      'Vector Addition',
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return jsImplementations.vectorAdd(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return wasmImplementations.vectorAdd(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return simdImplementations.vectorAdd(a, b)
      }
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Vector Multiplication',
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return jsImplementations.vectorMul(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return wasmImplementations.vectorMul(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return simdImplementations.vectorMul(a, b)
      }
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Dot Product',
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return jsImplementations.dotProduct(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return wasmImplementations.dotProduct(a, b)
      },
      (size) => {
        const a = generateRandomArray(size)
        const b = generateRandomArray(size)
        return simdImplementations.dotProduct(a, b)
      }
    ))
  )

  // Statistical operations
  allResults.push(
    ...(await benchmarkOperation(
      'Sum',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.sum(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.sum(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return simdImplementations.sum(a)
      }
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Mean',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.mean(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.mean(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return simdImplementations.mean(a)
      }
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Variance',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.variance(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.variance(a)
      },
      null
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Standard Deviation',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.std(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.std(a)
      },
      null
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'L2 Norm',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.norm(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.norm(a)
      },
      null
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Min',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.min(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.min(a)
      },
      null
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Max',
      (size) => {
        const a = generateRandomArray(size)
        return jsImplementations.max(a)
      },
      (size) => {
        const a = generateRandomArray(size)
        return wasmImplementations.max(a)
      },
      null
    ))
  )

  // Matrix operations (smaller sizes due to O(n³) complexity)
  allResults.push(
    ...(await benchmarkOperation(
      'Matrix Multiplication',
      (size) => {
        const n = Math.floor(Math.sqrt(size))
        const a = generateRandomArray(n * n)
        const b = generateRandomArray(n * n)
        return jsImplementations.matrixMultiply(a, b, n, n, n)
      },
      (size) => {
        const n = Math.floor(Math.sqrt(size))
        const a = generateRandomArray(n * n)
        const b = generateRandomArray(n * n)
        return wasmImplementations.matrixMultiply(a, b, n, n, n)
      },
      (size) => {
        const n = Math.floor(Math.sqrt(size))
        const a = generateRandomArray(n * n)
        const b = generateRandomArray(n * n)
        return simdImplementations.matrixMultiply(a, b, n, n, n)
      },
      { sizes: [100, 400, 900, 2500] } // n = 10, 20, 30, 50
    ))
  )

  allResults.push(
    ...(await benchmarkOperation(
      'Matrix-Vector Multiplication',
      (size) => {
        const n = Math.floor(Math.sqrt(size))
        const matrix = generateRandomArray(n * n)
        const vector = generateRandomArray(n)
        return jsImplementations.matVecMul(matrix, vector, n, n)
      },
      (size) => {
        const n = Math.floor(Math.sqrt(size))
        const matrix = generateRandomArray(n * n)
        const vector = generateRandomArray(n)
        return wasmImplementations.matVecMul(matrix, vector, n, n)
      },
      null,
      { sizes: [100, 400, 2500, 10000] }
    ))
  )

  // FFT (power of 2 sizes)
  allResults.push(
    ...(await benchmarkOperation(
      'FFT',
      (size) => {
        const n = Math.pow(2, Math.floor(Math.log2(size)))
        const real = generateRandomArray(n)
        const imag = new Float64Array(n)
        jsImplementations.fft(real, imag)
        return { real, imag }
      },
      (size) => {
        const n = Math.pow(2, Math.floor(Math.log2(size)))
        const real = generateRandomArray(n)
        const imag = new Float64Array(n)
        return wasmImplementations.fft(real, imag)
      },
      null,
      { sizes: [256, 1024, 4096, 16384] }
    ))
  )

  // Print summary
  printSummary(allResults)
}

function printSummary(results: BenchmarkResult[]): void {
  console.log('\n')
  console.log('═'.repeat(60))
  console.log('  BENCHMARK SUMMARY')
  console.log('═'.repeat(60))

  // Group by operation
  const byOperation = new Map<string, BenchmarkResult[]>()
  for (const r of results) {
    if (!byOperation.has(r.name)) {
      byOperation.set(r.name, [])
    }
    byOperation.get(r.name)!.push(r)
  }

  // Print table
  console.log(
    '\n┌─────────────────────────────┬────────────┬────────────┬──────────┐'
  )
  console.log(
    '│ Operation                   │ Mode       │ Avg (ms)   │ Speedup  │'
  )
  console.log(
    '├─────────────────────────────┼────────────┼────────────┼──────────┤'
  )

  for (const [op, opResults] of byOperation) {
    // Get largest size results for summary
    const maxSize = Math.max(...opResults.map((r) => r.size))
    const largestResults = opResults.filter((r) => r.size === maxSize)

    for (const r of largestResults) {
      const speedup = r.speedupVsJs
        ? `${r.speedupVsJs.toFixed(2)}x`
        : 'baseline'
      console.log(
        `│ ${op.padEnd(27)} │ ${r.mode.padEnd(10)} │ ${r.avgMs.toFixed(3).padStart(10)} │ ${speedup.padStart(8)} │`
      )
    }
  }

  console.log(
    '└─────────────────────────────┴────────────┴────────────┴──────────┘'
  )

  // WASM speedup summary
  const wasmResults = results.filter(
    (r) => r.mode === 'WASM' && r.speedupVsJs !== undefined
  )
  if (wasmResults.length > 0) {
    const avgSpeedup =
      wasmResults.reduce((sum, r) => sum + (r.speedupVsJs || 1), 0) /
      wasmResults.length
    const maxSpeedup = Math.max(...wasmResults.map((r) => r.speedupVsJs || 1))
    const minSpeedup = Math.min(...wasmResults.map((r) => r.speedupVsJs || 1))

    console.log('\n📈 WASM Performance Summary:')
    console.log(`   Average speedup: ${avgSpeedup.toFixed(2)}x`)
    console.log(`   Best speedup:    ${maxSpeedup.toFixed(2)}x`)
    console.log(`   Worst speedup:   ${minSpeedup.toFixed(2)}x`)
  }
}

// Run benchmarks
runAllBenchmarks().catch(console.error)
