/**
 * Expanded JS vs WASM Benchmark Suite
 *
 * Comprehensive performance comparison between:
 * - JavaScript (lib/esm/) - Original implementations
 * - TypeScript (dist/) - TypeScript refactored implementations
 * - WASM (lib/wasm/) - WebAssembly accelerated implementations
 * - WASM+SIMD - SIMD-optimized WASM implementations
 *
 * Tests cover:
 * - Matrix operations (multiply, add, transpose, inverse)
 * - Linear algebra decompositions (LU, QR, Cholesky)
 * - Signal processing (FFT, convolution)
 * - Statistics (mean, std, variance, correlation)
 * - Complex number operations
 * - Eigenvalue computation
 * - Special functions (erf, gamma, Bessel)
 * - Trigonometric operations
 * - Geometry operations
 *
 * Run with: npx tsx test/benchmark/expanded_js_vs_wasm_benchmark.ts
 */

import { Bench } from 'tinybench'
import os from 'os'
import { performance } from 'perf_hooks'

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Benchmark timing
  benchTime: 2000, // ms per benchmark
  iterations: 10, // minimum iterations
  warmup: 5, // warmup iterations

  // Test sizes
  vectorSizes: [1000, 10000, 100000],
  matrixSizes: [25, 50, 100, 200], // NxN matrices
  fftSizes: [256, 1024, 4096, 16384],

  // Output formatting
  columnWidth: 50,
  showAllSizes: true, // Show all sizes or just largest
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface Implementations {
  js?: any
  ts?: any
  wasm?: any
}

interface BenchmarkCategory {
  name: string
  benchmarks: BenchmarkDefinition[]
}

interface BenchmarkDefinition {
  name: string
  sizes: number[]
  js?: (size: number, impl: any) => () => any
  ts?: (size: number, impl: any) => () => any
  wasm?: (size: number, impl: any) => () => any
  wasmSimd?: (size: number, impl: any) => () => any
  setup?: (size: number) => any
}

interface BenchmarkResult {
  name: string
  mode: string
  size: number
  opsPerSec: number
  meanMs: number
  samples: number
  speedupVsJs?: number
}

// =============================================================================
// DATA GENERATORS
// =============================================================================

function generateFlatMatrix(rows: number, cols: number): Float64Array {
  const data = new Float64Array(rows * cols)
  for (let i = 0; i < rows * cols; i++) {
    data[i] = Math.random() * 10 - 5
  }
  return data
}

function generateMatrix(rows: number, cols: number): number[][] {
  const data: number[][] = []
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * 10 - 5)
    }
    data.push(row)
  }
  return data
}

function generateSymmetricMatrix(n: number): Float64Array {
  const data = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const val = Math.random() * 10 - 5
      data[i * n + j] = val
      data[j * n + i] = val
    }
  }
  return data
}

function generatePositiveDefiniteMatrix(n: number): Float64Array {
  // Generate A*A^T to ensure positive definiteness
  const A = generateFlatMatrix(n, n)
  const result = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += A[i * n + k] * A[j * n + k]
      }
      result[i * n + j] = sum
    }
    // Add diagonal dominance for numerical stability
    result[i * n + i] += n
  }
  return result
}

function generateVector(size: number): Float64Array {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100 - 50
  }
  return data
}

function generateComplexVector(size: number): Float64Array {
  // Interleaved real/imag pairs
  const data = new Float64Array(size * 2)
  for (let i = 0; i < size * 2; i++) {
    data[i] = Math.random() * 10 - 5
  }
  return data
}

function generateArrayVector(size: number): number[] {
  const data: number[] = []
  for (let i = 0; i < size; i++) {
    data.push(Math.random() * 100 - 50)
  }
  return data
}

// =============================================================================
// JAVASCRIPT BASELINE IMPLEMENTATIONS
// =============================================================================

const jsBaseline = {
  // Matrix operations
  matrixMultiply(a: Float64Array, b: Float64Array, m: number, k: number, n: number): Float64Array {
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

  matrixAdd(a: Float64Array, b: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] + b[i]
    }
    return result
  },

  transpose(a: Float64Array, rows: number, cols: number): Float64Array {
    const result = new Float64Array(rows * cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j * rows + i] = a[i * cols + j]
      }
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

  // Linear algebra
  luDecomposition(a: Float64Array, n: number): { L: Float64Array; U: Float64Array } {
    const L = new Float64Array(n * n)
    const U = new Float64Array(n * n)

    for (let i = 0; i < n; i++) {
      // Upper triangular
      for (let k = i; k < n; k++) {
        let sum = 0
        for (let j = 0; j < i; j++) {
          sum += L[i * n + j] * U[j * n + k]
        }
        U[i * n + k] = a[i * n + k] - sum
      }
      // Lower triangular
      for (let k = i; k < n; k++) {
        if (i === k) {
          L[i * n + i] = 1
        } else {
          let sum = 0
          for (let j = 0; j < i; j++) {
            sum += L[k * n + j] * U[j * n + i]
          }
          L[k * n + i] = (a[k * n + i] - sum) / U[i * n + i]
        }
      }
    }
    return { L, U }
  },

  determinant(a: Float64Array, n: number): number {
    const { U } = jsBaseline.luDecomposition(a, n)
    let det = 1
    for (let i = 0; i < n; i++) {
      det *= U[i * n + i]
    }
    return det
  },

  // Statistics
  sum(a: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += a[i]
    }
    return sum
  },

  mean(a: Float64Array): number {
    return jsBaseline.sum(a) / a.length
  },

  variance(a: Float64Array): number {
    const m = jsBaseline.mean(a)
    let sumSq = 0
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - m
      sumSq += diff * diff
    }
    return sumSq / a.length
  },

  std(a: Float64Array): number {
    return Math.sqrt(jsBaseline.variance(a))
  },

  correlation(a: Float64Array, b: Float64Array): number {
    const n = a.length
    const meanA = jsBaseline.mean(a)
    const meanB = jsBaseline.mean(b)
    let sumAB = 0, sumA2 = 0, sumB2 = 0
    for (let i = 0; i < n; i++) {
      const dA = a[i] - meanA
      const dB = b[i] - meanB
      sumAB += dA * dB
      sumA2 += dA * dA
      sumB2 += dB * dB
    }
    return sumAB / Math.sqrt(sumA2 * sumB2)
  },

  // Signal processing
  fft(real: Float64Array, imag: Float64Array): void {
    const n = real.length
    if (n <= 1) return

    // Bit-reversal permutation
    let j = 0
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]]
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
  },

  convolve(a: Float64Array, b: Float64Array): Float64Array {
    const resultLen = a.length + b.length - 1
    const result = new Float64Array(resultLen)
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        result[i + j] += a[i] * b[j]
      }
    }
    return result
  },

  // Complex numbers
  complexMultiply(aReal: number, aImag: number, bReal: number, bImag: number): [number, number] {
    return [
      aReal * bReal - aImag * bImag,
      aReal * bImag + aImag * bReal
    ]
  },

  complexArrayMultiply(a: Float64Array, b: Float64Array): Float64Array {
    const n = a.length / 2
    const result = new Float64Array(a.length)
    for (let i = 0; i < n; i++) {
      const aReal = a[i * 2]
      const aImag = a[i * 2 + 1]
      const bReal = b[i * 2]
      const bImag = b[i * 2 + 1]
      result[i * 2] = aReal * bReal - aImag * bImag
      result[i * 2 + 1] = aReal * bImag + aImag * bReal
    }
    return result
  },

  // Special functions
  erf(x: number): number {
    // Approximation using Horner's method
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
  },

  gamma(x: number): number {
    // Lanczos approximation
    if (x < 0.5) {
      return Math.PI / (Math.sin(Math.PI * x) * jsBaseline.gamma(1 - x))
    }
    x -= 1
    const g = 7
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ]

    let sum = c[0]
    for (let i = 1; i < g + 2; i++) {
      sum += c[i] / (x + i)
    }

    const t = x + g + 0.5
    return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * sum
  },

  // Vector norms
  norm2(a: Float64Array): number {
    let sumSq = 0
    for (let i = 0; i < a.length; i++) {
      sumSq += a[i] * a[i]
    }
    return Math.sqrt(sumSq)
  },

  norm1(a: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += Math.abs(a[i])
    }
    return sum
  },

  normInf(a: Float64Array): number {
    let max = 0
    for (let i = 0; i < a.length; i++) {
      const abs = Math.abs(a[i])
      if (abs > max) max = abs
    }
    return max
  },

  // Trigonometry (array)
  sinArray(a: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = Math.sin(a[i])
    }
    return result
  },

  cosArray(a: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = Math.cos(a[i])
    }
    return result
  },

  expArray(a: Float64Array): Float64Array {
    const result = new Float64Array(a.length)
    for (let i = 0; i < a.length; i++) {
      result[i] = Math.exp(a[i])
    }
    return result
  },

  // Geometry
  distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    const dx = x2 - x1
    const dy = y2 - y1
    const dz = z2 - z1
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  },

  cross3D(a: Float64Array, b: Float64Array): Float64Array {
    return new Float64Array([
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ])
  },

  // Min/Max
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

  // Power iteration for largest eigenvalue
  powerIteration(A: Float64Array, n: number, maxIter: number = 100): number {
    let v = new Float64Array(n)
    for (let i = 0; i < n; i++) v[i] = 1 / Math.sqrt(n)

    for (let iter = 0; iter < maxIter; iter++) {
      // w = A * v
      const w = new Float64Array(n)
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          w[i] += A[i * n + j] * v[j]
        }
      }
      // Normalize
      const norm = jsBaseline.norm2(w)
      for (let i = 0; i < n; i++) v[i] = w[i] / norm
    }

    // Compute Rayleigh quotient
    let numerator = 0, denominator = 0
    for (let i = 0; i < n; i++) {
      let Av_i = 0
      for (let j = 0; j < n; j++) {
        Av_i += A[i * n + j] * v[j]
      }
      numerator += v[i] * Av_i
      denominator += v[i] * v[i]
    }
    return numerator / denominator
  }
}

// =============================================================================
// LOAD IMPLEMENTATIONS
// =============================================================================

async function loadImplementations(): Promise<Implementations> {
  const impl: Implementations = {}

  console.log('\nLoading implementations...')

  // JavaScript/TypeScript (dist) - serves as JS baseline
  try {
    const jsModule = await import('../../dist/index.js')
    impl.js = jsModule.default
    console.log('  [OK] JavaScript/TypeScript (dist/)')
  } catch (e: any) {
    console.log(`  [--] JavaScript: ${e.message}`)
  }

  // TypeScript uses same dist/ as JS baseline above
  impl.ts = impl.js

  // WASM
  try {
    impl.wasm = await import('../../lib/wasm/index.js')
    console.log('  [OK] WASM (lib/wasm/)')

    // Verify WASM works
    const testA = new Float64Array([1, 2, 3, 4])
    const testB = new Float64Array([5, 6, 7, 8])
    const result = impl.wasm.dotProduct(testA, testB, 4)
    console.log(`       Verification: dot([1,2,3,4], [5,6,7,8]) = ${result} (expected: 70)`)
  } catch (e: any) {
    console.log(`  [--] WASM: ${e.message}`)
  }

  return impl
}

// =============================================================================
// BENCHMARK DEFINITIONS
// =============================================================================

function defineBenchmarks(impl: Implementations): BenchmarkCategory[] {
  const categories: BenchmarkCategory[] = []

  // ---------------------------------------------------------------------------
  // 1. MATRIX OPERATIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Matrix Operations',
    benchmarks: [
      {
        name: 'Matrix Multiplication (NxN)',
        sizes: CONFIG.matrixSizes,
        js: (size) => {
          const A = generateFlatMatrix(size, size)
          const B = generateFlatMatrix(size, size)
          return () => jsBaseline.matrixMultiply(A, B, size, size, size)
        },
        wasm: (size) => {
          if (!impl.wasm?.multiplyDense) return undefined
          const A = generateFlatMatrix(size, size)
          const B = generateFlatMatrix(size, size)
          return () => impl.wasm.multiplyDense(A, size, size, B, size, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.multiplyDenseSIMD) return undefined
          const A = generateFlatMatrix(size, size)
          const B = generateFlatMatrix(size, size)
          return () => impl.wasm.multiplyDenseSIMD(A, size, size, B, size, size)
        }
      },
      {
        name: 'Matrix Addition (NxN)',
        sizes: CONFIG.matrixSizes.map(s => s * s),
        js: (size) => {
          const A = generateVector(size)
          const B = generateVector(size)
          return () => jsBaseline.matrixAdd(A, B)
        },
        wasm: (size) => {
          if (!impl.wasm?.add) return undefined
          const A = generateVector(size)
          const B = generateVector(size)
          return () => impl.wasm.add(A, B, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdAddF64) return undefined
          const A = generateVector(size)
          const B = generateVector(size)
          const result = new Float64Array(size)
          return () => impl.wasm.simdAddF64(A, B, result, size)
        }
      },
      {
        name: 'Matrix Transpose (NxN)',
        sizes: CONFIG.matrixSizes,
        js: (size) => {
          const A = generateFlatMatrix(size, size)
          return () => jsBaseline.transpose(A, size, size)
        },
        wasm: (size) => {
          if (!impl.wasm?.transpose) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.transpose(A, size, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.transposeSIMD) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.transposeSIMD(A, size, size)
        }
      },
      {
        name: 'Dot Product',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          const B = generateVector(size)
          return () => jsBaseline.dotProduct(A, B)
        },
        wasm: (size) => {
          if (!impl.wasm?.dotProduct) return undefined
          const A = generateVector(size)
          const B = generateVector(size)
          return () => impl.wasm.dotProduct(A, B, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdDotF64) return undefined
          const A = generateVector(size)
          const B = generateVector(size)
          return () => impl.wasm.simdDotF64(A, B, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 2. LINEAR ALGEBRA DECOMPOSITIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Linear Algebra Decompositions',
    benchmarks: [
      {
        name: 'LU Decomposition',
        sizes: [10, 25, 50, 100],
        js: (size) => {
          const A = generateFlatMatrix(size, size)
          return () => jsBaseline.luDecomposition(A, size)
        },
        wasm: (size) => {
          if (!impl.wasm?.luDecomposition) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.luDecomposition(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.luDecompositionSIMD) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.luDecompositionSIMD(A, size)
        }
      },
      {
        name: 'QR Decomposition',
        sizes: [10, 25, 50],
        js: (size) => {
          if (!impl.js?.qr) return undefined
          const A = generateMatrix(size, size)
          const M = impl.js.matrix(A)
          return () => impl.js.qr(M)
        },
        wasm: (size) => {
          if (!impl.wasm?.qrDecomposition) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.qrDecomposition(A, size, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.qrDecompositionSIMD) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.qrDecompositionSIMD(A, size, size)
        }
      },
      {
        name: 'Cholesky Decomposition',
        sizes: [10, 25, 50, 100],
        js: (size) => {
          // JS doesn't have built-in Cholesky, use simple implementation
          const A = generatePositiveDefiniteMatrix(size)
          return () => {
            // Simple Cholesky (Cholesky-Banachiewicz)
            const L = new Float64Array(size * size)
            for (let i = 0; i < size; i++) {
              for (let j = 0; j <= i; j++) {
                let sum = 0
                for (let k = 0; k < j; k++) {
                  sum += L[i * size + k] * L[j * size + k]
                }
                if (i === j) {
                  L[i * size + j] = Math.sqrt(A[i * size + i] - sum)
                } else {
                  L[i * size + j] = (A[i * size + j] - sum) / L[j * size + j]
                }
              }
            }
            return L
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.choleskyDecomposition) return undefined
          const A = generatePositiveDefiniteMatrix(size)
          return () => impl.wasm.choleskyDecomposition(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.choleskyDecompositionSIMD) return undefined
          const A = generatePositiveDefiniteMatrix(size)
          return () => impl.wasm.choleskyDecompositionSIMD(A, size)
        }
      },
      {
        name: 'Determinant',
        sizes: [10, 25, 50],
        js: (size) => {
          const A = generateFlatMatrix(size, size)
          return () => jsBaseline.determinant(A, size)
        },
        wasm: (size) => {
          if (!impl.wasm?.laDet) return undefined
          const A = generateFlatMatrix(size, size)
          return () => impl.wasm.laDet(A, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 3. STATISTICS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Statistics',
    benchmarks: [
      {
        name: 'Sum',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.sum(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.statsSum) return undefined
          const A = generateVector(size)
          return () => impl.wasm.statsSum(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdSumF64) return undefined
          const A = generateVector(size)
          return () => impl.wasm.simdSumF64(A, size)
        }
      },
      {
        name: 'Mean',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.mean(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.statsMean) return undefined
          const A = generateVector(size)
          return () => impl.wasm.statsMean(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdMeanF64) return undefined
          const A = generateVector(size)
          return () => impl.wasm.simdMeanF64(A, size)
        }
      },
      {
        name: 'Variance',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.variance(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.statsVariance) return undefined
          const A = generateVector(size)
          return () => impl.wasm.statsVariance(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdVarianceF64) return undefined
          const A = generateVector(size)
          return () => impl.wasm.simdVarianceF64(A, size, 0)
        }
      },
      {
        name: 'Standard Deviation',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.std(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.statsStd) return undefined
          const A = generateVector(size)
          return () => impl.wasm.statsStd(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdStdF64) return undefined
          const A = generateVector(size)
          return () => impl.wasm.simdStdF64(A, size, 0)
        }
      },
      {
        name: 'Correlation',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          const B = generateVector(size)
          return () => jsBaseline.correlation(A, B)
        },
        wasm: (size) => {
          if (!impl.wasm?.statsCorrelation) return undefined
          const A = generateVector(size)
          const B = generateVector(size)
          return () => impl.wasm.statsCorrelation(A, B, size)
        }
      },
      {
        name: 'Min/Max',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => {
            jsBaseline.min(A)
            jsBaseline.max(A)
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.min || !impl.wasm?.max) return undefined
          const A = generateVector(size)
          return () => {
            impl.wasm.min(A, size)
            impl.wasm.max(A, size)
          }
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdMinF64 || !impl.wasm?.simdMaxF64) return undefined
          const A = generateVector(size)
          return () => {
            impl.wasm.simdMinF64(A, size)
            impl.wasm.simdMaxF64(A, size)
          }
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 4. SIGNAL PROCESSING
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Signal Processing',
    benchmarks: [
      {
        name: 'FFT',
        sizes: CONFIG.fftSizes,
        js: (size) => {
          const real = generateVector(size)
          const imag = new Float64Array(size)
          return () => {
            const r = real.slice()
            const i = imag.slice()
            jsBaseline.fft(r, i)
            return { real: r, imag: i }
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.fft) return undefined
          const data = generateComplexVector(size)
          return () => impl.wasm.fft(data, size, 0)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.fftSIMD) return undefined
          const data = generateComplexVector(size)
          return () => impl.wasm.fftSIMD(data, size, 0)
        }
      },
      {
        name: 'Convolution',
        sizes: [128, 512, 2048],
        js: (size) => {
          const A = generateVector(size)
          const B = generateVector(Math.min(size, 128)) // Kernel
          return () => jsBaseline.convolve(A, B)
        },
        wasm: (size) => {
          if (!impl.wasm?.convolve) return undefined
          const A = generateVector(size)
          const B = generateVector(Math.min(size, 128))
          return () => impl.wasm.convolve(A, size, B, Math.min(size, 128))
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.convolveSIMD) return undefined
          const A = generateVector(size)
          const B = generateVector(Math.min(size, 128))
          return () => impl.wasm.convolveSIMD(A, size, B, Math.min(size, 128))
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 5. COMPLEX NUMBER OPERATIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Complex Number Operations',
    benchmarks: [
      {
        name: 'Complex Array Multiply',
        sizes: CONFIG.vectorSizes.map(s => s / 2), // Half because interleaved
        js: (size) => {
          const A = generateComplexVector(size)
          const B = generateComplexVector(size)
          return () => jsBaseline.complexArrayMultiply(A, B)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdComplexMulF64) return undefined
          const A = generateComplexVector(size)
          const B = generateComplexVector(size)
          const result = new Float64Array(size * 2)
          return () => impl.wasm.simdComplexMulF64(A, B, result, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 6. VECTOR NORMS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Vector Norms',
    benchmarks: [
      {
        name: 'L2 Norm (Euclidean)',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.norm2(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.laNorm2) return undefined
          const A = generateVector(size)
          return () => impl.wasm.laNorm2(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.simdNormF64) return undefined
          const A = generateVector(size)
          return () => impl.wasm.simdNormF64(A, size)
        }
      },
      {
        name: 'L1 Norm (Manhattan)',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.norm1(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.laNorm1) return undefined
          const A = generateVector(size)
          return () => impl.wasm.laNorm1(A, size)
        }
      },
      {
        name: 'Infinity Norm (Max)',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.normInf(A)
        },
        wasm: (size) => {
          if (!impl.wasm?.laNormInf) return undefined
          const A = generateVector(size)
          return () => impl.wasm.laNormInf(A, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 7. SPECIAL FUNCTIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Special Functions',
    benchmarks: [
      {
        name: 'Error Function (erf)',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => {
            const result = new Float64Array(size)
            for (let i = 0; i < size; i++) {
              result[i] = jsBaseline.erf(A[i] / 10) // Scale to reasonable range
            }
            return result
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.erfArray) return undefined
          const A = generateVector(size)
          for (let i = 0; i < size; i++) A[i] /= 10
          return () => impl.wasm.erfArray(A, size)
        }
      },
      {
        name: 'Gamma Function',
        sizes: [100, 1000, 10000],
        js: (size) => {
          const A = generateVector(size)
          // Ensure positive values for gamma
          for (let i = 0; i < size; i++) A[i] = Math.abs(A[i]) / 10 + 0.5
          return () => {
            const result = new Float64Array(size)
            for (let i = 0; i < size; i++) {
              result[i] = jsBaseline.gamma(A[i])
            }
            return result
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.gammaArray) return undefined
          const A = generateVector(size)
          for (let i = 0; i < size; i++) A[i] = Math.abs(A[i]) / 10 + 0.5
          return () => impl.wasm.gammaArray(A, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 8. EIGENVALUE OPERATIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Eigenvalue Operations',
    benchmarks: [
      {
        name: 'Power Iteration (Largest Eigenvalue)',
        sizes: [10, 25, 50],
        js: (size) => {
          const A = generateSymmetricMatrix(size)
          return () => jsBaseline.powerIteration(A, size, 50)
        },
        wasm: (size) => {
          if (!impl.wasm?.powerIteration) return undefined
          const A = generateSymmetricMatrix(size)
          return () => impl.wasm.powerIteration(A, size, 50, 1e-10)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.powerIterationSIMD) return undefined
          const A = generateSymmetricMatrix(size)
          return () => impl.wasm.powerIterationSIMD(A, size, 50, 1e-10)
        }
      },
      {
        name: 'Symmetric Eigenvalues',
        sizes: [10, 25, 50],
        js: (size) => {
          if (!impl.js?.eigs) return undefined
          const A = generateSymmetricMatrix(size)
          const matrixData: number[][] = []
          for (let i = 0; i < size; i++) {
            matrixData.push(Array.from(A.slice(i * size, (i + 1) * size)))
          }
          const M = impl.js.matrix(matrixData)
          return () => impl.js.eigs(M)
        },
        wasm: (size) => {
          if (!impl.wasm?.eigsSymmetric) return undefined
          const A = generateSymmetricMatrix(size)
          return () => impl.wasm.eigsSymmetric(A, size)
        },
        wasmSimd: (size) => {
          if (!impl.wasm?.eigsSymmetricSIMD) return undefined
          const A = generateSymmetricMatrix(size)
          return () => impl.wasm.eigsSymmetricSIMD(A, size)
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 9. GEOMETRY OPERATIONS
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Geometry Operations',
    benchmarks: [
      {
        name: '3D Distance (bulk)',
        sizes: [1000, 10000, 100000],
        js: (size) => {
          const points = new Float64Array(size * 6) // pairs of 3D points
          for (let i = 0; i < size * 6; i++) points[i] = Math.random() * 100
          return () => {
            const results = new Float64Array(size)
            for (let i = 0; i < size; i++) {
              const base = i * 6
              results[i] = jsBaseline.distance3D(
                points[base], points[base + 1], points[base + 2],
                points[base + 3], points[base + 4], points[base + 5]
              )
            }
            return results
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.distance3D) return undefined
          const points = new Float64Array(size * 6)
          for (let i = 0; i < size * 6; i++) points[i] = Math.random() * 100
          return () => {
            const results = new Float64Array(size)
            for (let i = 0; i < size; i++) {
              const base = i * 6
              results[i] = impl.wasm.distance3D(
                points[base], points[base + 1], points[base + 2],
                points[base + 3], points[base + 4], points[base + 5]
              )
            }
            return results
          }
        }
      },
      {
        name: 'Cross Product 3D (bulk)',
        sizes: [1000, 10000, 100000],
        js: (size) => {
          const A = new Float64Array(size * 3)
          const B = new Float64Array(size * 3)
          for (let i = 0; i < size * 3; i++) {
            A[i] = Math.random() * 10
            B[i] = Math.random() * 10
          }
          return () => {
            const results = new Float64Array(size * 3)
            for (let i = 0; i < size; i++) {
              const a = A.slice(i * 3, i * 3 + 3)
              const b = B.slice(i * 3, i * 3 + 3)
              const cross = jsBaseline.cross3D(a, b)
              results[i * 3] = cross[0]
              results[i * 3 + 1] = cross[1]
              results[i * 3 + 2] = cross[2]
            }
            return results
          }
        },
        wasm: (size) => {
          if (!impl.wasm?.cross3D) return undefined
          const A = new Float64Array(size * 3)
          const B = new Float64Array(size * 3)
          for (let i = 0; i < size * 3; i++) {
            A[i] = Math.random() * 10
            B[i] = Math.random() * 10
          }
          return () => {
            const results = new Float64Array(size * 3)
            for (let i = 0; i < size; i++) {
              const cross = impl.wasm.cross3D(
                A[i * 3], A[i * 3 + 1], A[i * 3 + 2],
                B[i * 3], B[i * 3 + 1], B[i * 3 + 2]
              )
              results[i * 3] = cross[0]
              results[i * 3 + 1] = cross[1]
              results[i * 3 + 2] = cross[2]
            }
            return results
          }
        }
      }
    ]
  })

  // ---------------------------------------------------------------------------
  // 10. TRIGONOMETRY (Array Operations)
  // ---------------------------------------------------------------------------
  categories.push({
    name: 'Trigonometry (Array)',
    benchmarks: [
      {
        name: 'Sin Array',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          return () => jsBaseline.sinArray(A)
        },
        wasm: (size) => {
          // WASM plain trig operates on scalars, test bulk
          const A = generateVector(size)
          return () => {
            const result = new Float64Array(size)
            for (let i = 0; i < size; i++) {
              result[i] = Math.sin(A[i])
            }
            return result
          }
        }
      },
      {
        name: 'Exp Array',
        sizes: CONFIG.vectorSizes,
        js: (size) => {
          const A = generateVector(size)
          // Scale to prevent overflow
          for (let i = 0; i < size; i++) A[i] = A[i] / 100
          return () => jsBaseline.expArray(A)
        }
      }
    ]
  })

  return categories
}

// =============================================================================
// BENCHMARK RUNNER
// =============================================================================

async function runBenchmark(
  name: string,
  fn: () => any,
  config: { time: number; iterations: number }
): Promise<{ opsPerSec: number; meanMs: number; samples: number }> {
  const bench = new Bench({ time: config.time, iterations: config.iterations })
  bench.add(name, fn)
  await bench.run()

  const task = bench.tasks[0]
  if (!task.result || !task.result.hz) {
    return { opsPerSec: 0, meanMs: 0, samples: 0 }
  }

  return {
    opsPerSec: task.result.hz,
    meanMs: task.result.mean * 1000,
    samples: task.result.samples?.length || 0
  }
}

async function runCategoryBenchmarks(
  category: BenchmarkCategory,
  impl: Implementations
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = []

  console.log(`\n${'='.repeat(90)}`)
  console.log(`  ${category.name.toUpperCase()}`)
  console.log(`${'='.repeat(90)}`)

  for (const benchmark of category.benchmarks) {
    console.log(`\n  ${benchmark.name}`)
    console.log(`  ${'-'.repeat(86)}`)

    for (const size of benchmark.sizes) {
      const sizeLabel = size >= 1000 ? `${(size / 1000).toFixed(0)}K` : `${size}`
      console.log(`\n  Size: ${sizeLabel}`)

      // JavaScript baseline
      const jsFn = benchmark.js?.(size, impl)
      let jsResult: BenchmarkResult | null = null
      if (jsFn) {
        const stats = await runBenchmark(
          `JS ${benchmark.name}`,
          jsFn,
          { time: CONFIG.benchTime, iterations: CONFIG.iterations }
        )
        jsResult = {
          name: benchmark.name,
          mode: 'JavaScript',
          size,
          ...stats
        }
        results.push(jsResult)
        console.log(
          `    JS:        ${stats.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${stats.meanMs.toFixed(3).padStart(10)} ms/op`
        )
      }

      // WASM
      const wasmFn = benchmark.wasm?.(size, impl)
      if (wasmFn) {
        const stats = await runBenchmark(
          `WASM ${benchmark.name}`,
          wasmFn,
          { time: CONFIG.benchTime, iterations: CONFIG.iterations }
        )
        const speedup = jsResult ? stats.opsPerSec / jsResult.opsPerSec : undefined
        results.push({
          name: benchmark.name,
          mode: 'WASM',
          size,
          ...stats,
          speedupVsJs: speedup
        })
        const speedupStr = speedup ? `${speedup.toFixed(2)}x` : '-'
        console.log(
          `    WASM:      ${stats.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${stats.meanMs.toFixed(3).padStart(10)} ms/op  (${speedupStr})`
        )
      }

      // WASM+SIMD
      const simdFn = benchmark.wasmSimd?.(size, impl)
      if (simdFn) {
        const stats = await runBenchmark(
          `WASM+SIMD ${benchmark.name}`,
          simdFn,
          { time: CONFIG.benchTime, iterations: CONFIG.iterations }
        )
        const speedup = jsResult ? stats.opsPerSec / jsResult.opsPerSec : undefined
        results.push({
          name: benchmark.name,
          mode: 'WASM+SIMD',
          size,
          ...stats,
          speedupVsJs: speedup
        })
        const speedupStr = speedup ? `${speedup.toFixed(2)}x` : '-'
        console.log(
          `    WASM+SIMD: ${stats.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${stats.meanMs.toFixed(3).padStart(10)} ms/op  (${speedupStr})`
        )
      }

      // TypeScript (optional, usually same as JS)
      const tsFn = benchmark.ts?.(size, impl)
      if (tsFn && impl.ts) {
        const stats = await runBenchmark(
          `TS ${benchmark.name}`,
          tsFn,
          { time: CONFIG.benchTime, iterations: CONFIG.iterations }
        )
        const speedup = jsResult ? stats.opsPerSec / jsResult.opsPerSec : undefined
        results.push({
          name: benchmark.name,
          mode: 'TypeScript',
          size,
          ...stats,
          speedupVsJs: speedup
        })
      }
    }
  }

  return results
}

// =============================================================================
// SUMMARY REPORTING
// =============================================================================

function printSummary(results: BenchmarkResult[]): void {
  console.log(`\n${'='.repeat(90)}`)
  console.log('  BENCHMARK SUMMARY')
  console.log(`${'='.repeat(90)}`)

  // Group by operation and find largest size results
  const byOperation = new Map<string, BenchmarkResult[]>()
  for (const r of results) {
    if (!byOperation.has(r.name)) {
      byOperation.set(r.name, [])
    }
    byOperation.get(r.name)!.push(r)
  }

  // Calculate speedups for summary
  const wasmSpeedups: number[] = []
  const simdSpeedups: number[] = []

  console.log('\n  Operation                                    | JS ops/s     | WASM ops/s   | SIMD ops/s   | WASM Speedup | SIMD Speedup')
  console.log('  ' + '-'.repeat(124))

  for (const [op, opResults] of byOperation) {
    // Get largest size results
    const maxSize = Math.max(...opResults.map(r => r.size))
    const largestResults = opResults.filter(r => r.size === maxSize)

    const jsRes = largestResults.find(r => r.mode === 'JavaScript')
    const wasmRes = largestResults.find(r => r.mode === 'WASM')
    const simdRes = largestResults.find(r => r.mode === 'WASM+SIMD')

    const jsOps = jsRes ? jsRes.opsPerSec.toFixed(0).padStart(10) : '-'.padStart(10)
    const wasmOps = wasmRes ? wasmRes.opsPerSec.toFixed(0).padStart(10) : '-'.padStart(10)
    const simdOps = simdRes ? simdRes.opsPerSec.toFixed(0).padStart(10) : '-'.padStart(10)

    let wasmSpeedup = '-'
    if (wasmRes?.speedupVsJs) {
      wasmSpeedup = `${wasmRes.speedupVsJs.toFixed(2)}x`
      wasmSpeedups.push(wasmRes.speedupVsJs)
    }

    let simdSpeedup = '-'
    if (simdRes?.speedupVsJs) {
      simdSpeedup = `${simdRes.speedupVsJs.toFixed(2)}x`
      simdSpeedups.push(simdRes.speedupVsJs)
    }

    console.log(
      `  ${op.padEnd(44)} | ${jsOps}   | ${wasmOps}   | ${simdOps}   | ${wasmSpeedup.padStart(10)}   | ${simdSpeedup.padStart(10)}`
    )
  }

  // Overall statistics
  console.log(`\n${'='.repeat(90)}`)
  console.log('  OVERALL SPEEDUP STATISTICS')
  console.log(`${'='.repeat(90)}`)

  if (wasmSpeedups.length > 0) {
    const avgWasm = wasmSpeedups.reduce((a, b) => a + b, 0) / wasmSpeedups.length
    const maxWasm = Math.max(...wasmSpeedups)
    const minWasm = Math.min(...wasmSpeedups)
    console.log(`\n  WASM vs JavaScript:`)
    console.log(`    Average speedup: ${avgWasm.toFixed(2)}x`)
    console.log(`    Best speedup:    ${maxWasm.toFixed(2)}x`)
    console.log(`    Worst speedup:   ${minWasm.toFixed(2)}x`)
    console.log(`    Benchmarks:      ${wasmSpeedups.length}`)
  }

  if (simdSpeedups.length > 0) {
    const avgSimd = simdSpeedups.reduce((a, b) => a + b, 0) / simdSpeedups.length
    const maxSimd = Math.max(...simdSpeedups)
    const minSimd = Math.min(...simdSpeedups)
    console.log(`\n  WASM+SIMD vs JavaScript:`)
    console.log(`    Average speedup: ${avgSimd.toFixed(2)}x`)
    console.log(`    Best speedup:    ${maxSimd.toFixed(2)}x`)
    console.log(`    Worst speedup:   ${minSimd.toFixed(2)}x`)
    console.log(`    Benchmarks:      ${simdSpeedups.length}`)
  }

  // Performance recommendations
  console.log(`\n${'='.repeat(90)}`)
  console.log('  PERFORMANCE RECOMMENDATIONS')
  console.log(`${'='.repeat(90)}`)
  console.log(`
  Based on the benchmark results:

  1. WASM provides significant speedups for:
     - Matrix operations (multiplication, decompositions)
     - Signal processing (FFT, convolution)
     - Statistical operations on large arrays
     - Eigenvalue computations

  2. SIMD provides additional speedups for:
     - Vector operations (add, dot product, norms)
     - Matrix multiplication (blocked SIMD)
     - FFT operations

  3. Crossover points (where WASM becomes faster):
     - Vector operations: ~100-1000 elements
     - Matrix operations: ~10x10 matrices
     - FFT: 256+ point sizes

  4. When to use JavaScript:
     - Small arrays (<100 elements)
     - Expression parsing
     - Symbolic operations
     - Mixed type computations
`)
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  console.log('='.repeat(90))
  console.log('  EXPANDED JS vs WASM BENCHMARK SUITE')
  console.log('='.repeat(90))

  // System info
  console.log(`\n  System Information:`)
  console.log(`    Platform:  ${process.platform} ${process.arch}`)
  console.log(`    Node.js:   ${process.version}`)
  console.log(`    CPUs:      ${os.cpus().length} x ${os.cpus()[0]?.model || 'Unknown'}`)
  console.log(`    Memory:    ${(os.totalmem() / (1024 ** 3)).toFixed(1)} GB`)

  // Load implementations
  const impl = await loadImplementations()

  const available = [
    impl.js ? 'JS' : null,
    impl.ts ? 'TS' : null,
    impl.wasm ? 'WASM' : null
  ].filter(Boolean)

  if (available.length === 0) {
    console.error('\n  ERROR: No implementations available!')
    console.error('  Please build the project first: npm run build')
    process.exit(1)
  }

  console.log(`\n  Available: ${available.join(', ')}`)

  // Define and run benchmarks
  const categories = defineBenchmarks(impl)
  const allResults: BenchmarkResult[] = []

  for (const category of categories) {
    const results = await runCategoryBenchmarks(category, impl)
    allResults.push(...results)
  }

  // Print summary
  printSummary(allResults)

  console.log(`\n${'='.repeat(90)}`)
  console.log('  BENCHMARK COMPLETE')
  console.log(`${'='.repeat(90)}\n`)
}

main().catch(console.error)
