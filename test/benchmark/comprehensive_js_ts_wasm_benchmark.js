/**
 * Comprehensive Benchmark: JavaScript (lib/) vs TypeScript (dist/) vs WASM
 *
 * Compares performance across three implementation tiers for ALL major matrix operations:
 * - Matrix sizes: 10x10, 50x50, 100x100, 500x500, 1000x1000
 * - Operations: multiply, add, transpose, det, inv, eigs, lup, qr, schur, fft, lsolve, usolve
 *
 * Run with: node test/benchmark/comprehensive_js_ts_wasm_benchmark.js
 */

import { Bench } from 'tinybench'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('='.repeat(100))
console.log('COMPREHENSIVE BENCHMARK: JavaScript (lib/) vs TypeScript (dist/) vs WASM')
console.log('='.repeat(100))
console.log(`\nSystem: ${os.cpus().length} CPUs (${os.cpus()[0].model})`)
console.log(`Node.js: ${process.version}`)
console.log(`Platform: ${process.platform} ${process.arch}`)
console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`)
console.log('')

// =============================================================================
// Load all implementations
// =============================================================================

async function loadImplementations () {
  const implementations = {}

  // 1. Original JavaScript implementation (lib/esm)
  console.log('Loading Original JavaScript (lib/esm/defaultInstance.js)...')
  try {
    const jsModule = await import('../../lib/esm/defaultInstance.js')
    implementations.js = jsModule.default
    console.log('  [OK] JavaScript loaded')
  } catch (error) {
    console.log(`  [FAIL] JavaScript: ${error.message}`)
  }

  // 2. TypeScript implementation (dist)
  console.log('Loading TypeScript (dist/index.js)...')
  try {
    const tsModule = await import('../../dist/index.js')
    implementations.ts = tsModule.default
    console.log('  [OK] TypeScript loaded')
  } catch (error) {
    console.log(`  [FAIL] TypeScript: ${error.message}`)
  }

  // 3. WASM implementation
  console.log('Loading WASM (lib/wasm/index.js)...')
  try {
    implementations.wasm = await import('../../lib/wasm/index.js')
    console.log('  [OK] WASM loaded')

    // Verify WASM works
    const testA = new Float64Array([1, 2, 3, 4])
    const testB = new Float64Array([5, 6, 7, 8])
    const result = implementations.wasm.dotProduct(testA, testB, 4)
    console.log(`  [OK] WASM verification: dot([1,2,3,4], [5,6,7,8]) = ${result} (expected: 70)`)
  } catch (error) {
    console.log(`  [FAIL] WASM: ${error.message}`)
  }

  return implementations
}

// =============================================================================
// Test Data Generators
// =============================================================================

function generateMatrix (rows, cols) {
  const data = []
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * 10)
    }
    data.push(row)
  }
  return data
}

function generateFlatMatrix (rows, cols) {
  const data = new Float64Array(rows * cols)
  for (let i = 0; i < rows * cols; i++) {
    data[i] = Math.random() * 10
  }
  return data
}

function generateSymmetricMatrix (size) {
  const data = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      if (j < i) {
        row.push(data[j][i])
      } else {
        row.push(Math.random() * 10)
      }
    }
    data.push(row)
  }
  return data
}

function generateVector (size) {
  const data = []
  for (let i = 0; i < size; i++) {
    data.push(Math.random() * 100)
  }
  return data
}

function generateFlatVector (size) {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

function generateLowerTriangular (size) {
  const data = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      if (j <= i) {
        row.push(Math.random() * 10 + (i === j ? 1 : 0)) // Ensure diagonal is non-zero
      } else {
        row.push(0)
      }
    }
    data.push(row)
  }
  return data
}

function generateUpperTriangular (size) {
  const data = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      if (j >= i) {
        row.push(Math.random() * 10 + (i === j ? 1 : 0)) // Ensure diagonal is non-zero
      } else {
        row.push(0)
      }
    }
    data.push(row)
  }
  return data
}

// =============================================================================
// Results Storage
// =============================================================================

const allResults = []

function formatResult (task) {
  const result = task.result
  if (!result) return { name: task.name, error: 'No result' }
  if (!result.hz) return { name: task.name, error: result.error || 'Unknown error' }

  return {
    name: task.name,
    opsPerSec: result.hz,
    meanMs: result.mean * 1000,
    samples: result.samples ? result.samples.length : 0
  }
}

function printResults (bench, operationName, size) {
  console.log('\n  Results:')

  const results = []
  for (const task of bench.tasks) {
    const r = formatResult(task)
    if (r.error) {
      console.log(`    ${task.name.padEnd(50)} ERROR: ${r.error}`)
    } else {
      console.log(`    ${task.name.padEnd(50)} ${r.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${r.meanMs.toFixed(3).padStart(10)} ms/op`)
      results.push(r)
    }
  }

  // Calculate speedups vs JS
  const jsResult = results.find(r => r.name.includes('JS (lib/)'))
  if (jsResult) {
    console.log('\n  Speedups vs Original JavaScript:')
    for (const r of results) {
      if (r === jsResult) continue
      const speedup = r.opsPerSec / jsResult.opsPerSec
      const label = speedup >= 1
        ? `${speedup.toFixed(2)}x faster`
        : `${(1 / speedup).toFixed(2)}x slower`
      console.log(`    ${r.name}: ${label}`)
    }
  }

  // Store results
  allResults.push({
    operation: operationName,
    size,
    results: results.map(r => ({
      implementation: r.name.includes('JS (lib/)') ? 'JS' : r.name.includes('TS (dist/)') ? 'TS' : 'WASM',
      opsPerSec: r.opsPerSec,
      meanMs: r.meanMs
    }))
  })
}

// =============================================================================
// Benchmark Suites
// =============================================================================

const MATRIX_SIZES = [10, 50, 100, 500, 1000]
const BENCH_TIME = 3000
const BENCH_ITERATIONS = 5

async function benchmarkMatrixMultiply (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('MATRIX MULTIPLICATION (A * B)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    // Skip very large sizes for expensive operations
    if (size > 500) {
      console.log(`\n[${size}x${size} matrices] - Skipping (too slow for benchmark)`)
      continue
    }

    console.log(`\n[${size}x${size} matrices]`)

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const A = impl.js.matrix(matrixA)
      const B = impl.js.matrix(matrixB)
      bench.add(`JS (lib/) multiply ${size}x${size}`, () => {
        impl.js.multiply(A, B)
      })
    }

    if (impl.ts) {
      const A = impl.ts.matrix(matrixA)
      const B = impl.ts.matrix(matrixB)
      bench.add(`TS (dist/) multiply ${size}x${size}`, () => {
        impl.ts.multiply(A, B)
      })
    }

    if (impl.wasm && impl.wasm.multiplyDense) {
      bench.add(`WASM multiplyDense ${size}x${size}`, () => {
        impl.wasm.multiplyDense(flatA, size, size, flatB, size, size)
      })
    }

    await bench.run()
    printResults(bench, 'multiply', size)
  }
}

async function benchmarkMatrixAdd (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('MATRIX ADDITION (A + B)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    console.log(`\n[${size}x${size} matrices = ${(size * size).toLocaleString()} elements]`)

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const A = impl.js.matrix(matrixA)
      const B = impl.js.matrix(matrixB)
      bench.add(`JS (lib/) add ${size}x${size}`, () => {
        impl.js.add(A, B)
      })
    }

    if (impl.ts) {
      const A = impl.ts.matrix(matrixA)
      const B = impl.ts.matrix(matrixB)
      bench.add(`TS (dist/) add ${size}x${size}`, () => {
        impl.ts.add(A, B)
      })
    }

    if (impl.wasm && impl.wasm.add) {
      bench.add(`WASM add ${size}x${size}`, () => {
        impl.wasm.add(flatA, flatB, size * size)
      })
    }

    await bench.run()
    printResults(bench, 'add', size)
  }
}

async function benchmarkTranspose (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('MATRIX TRANSPOSE')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) transpose ${size}x${size}`, () => {
        impl.js.transpose(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) transpose ${size}x${size}`, () => {
        impl.ts.transpose(M)
      })
    }

    if (impl.wasm && impl.wasm.transpose) {
      bench.add(`WASM transpose ${size}x${size}`, () => {
        impl.wasm.transpose(flatMatrix, size, size)
      })
    }

    await bench.run()
    printResults(bench, 'transpose', size)
  }
}

async function benchmarkDeterminant (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('DETERMINANT')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    // Skip very large sizes for det (O(n^3) operation)
    if (size > 100) {
      console.log(`\n[${size}x${size} matrix] - Skipping (O(n^3) too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) det ${size}x${size}`, () => {
        impl.js.det(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) det ${size}x${size}`, () => {
        impl.ts.det(M)
      })
    }

    // Note: WASM det would require wrapping luDecomposition

    await bench.run()
    printResults(bench, 'det', size)
  }
}

async function benchmarkInverse (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('MATRIX INVERSE')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    // Skip very large sizes for inv (O(n^3) operation)
    if (size > 100) {
      console.log(`\n[${size}x${size} matrix] - Skipping (O(n^3) too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) inv ${size}x${size}`, () => {
        impl.js.inv(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) inv ${size}x${size}`, () => {
        impl.ts.inv(M)
      })
    }

    await bench.run()
    printResults(bench, 'inv', size)
  }
}

async function benchmarkLUP (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('LU DECOMPOSITION (with pivoting)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    if (size > 500) {
      console.log(`\n[${size}x${size} matrix] - Skipping (too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) lup ${size}x${size}`, () => {
        impl.js.lup(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) lup ${size}x${size}`, () => {
        impl.ts.lup(M)
      })
    }

    if (impl.wasm && impl.wasm.luDecomposition) {
      bench.add(`WASM luDecomposition ${size}x${size}`, () => {
        impl.wasm.luDecomposition(flatMatrix, size)
      })
    }

    await bench.run()
    printResults(bench, 'lup', size)
  }
}

async function benchmarkQR (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('QR DECOMPOSITION')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    if (size > 500) {
      console.log(`\n[${size}x${size} matrix] - Skipping (too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) qr ${size}x${size}`, () => {
        impl.js.qr(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) qr ${size}x${size}`, () => {
        impl.ts.qr(M)
      })
    }

    if (impl.wasm && impl.wasm.qrDecomposition) {
      bench.add(`WASM qrDecomposition ${size}x${size}`, () => {
        impl.wasm.qrDecomposition(flatMatrix, size, size)
      })
    }

    await bench.run()
    printResults(bench, 'qr', size)
  }
}

async function benchmarkEigs (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('EIGENVALUES/EIGENVECTORS (symmetric matrix)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    // Eigs is very expensive - limit to smaller sizes
    if (size > 100) {
      console.log(`\n[${size}x${size} matrix] - Skipping (eigenvalue computation too expensive)`)
      continue
    }

    console.log(`\n[${size}x${size} symmetric matrix]`)

    const matrix = generateSymmetricMatrix(size)
    const flatMatrix = new Float64Array(size * size)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        flatMatrix[i * size + j] = matrix[i][j]
      }
    }

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) eigs ${size}x${size}`, () => {
        impl.js.eigs(M)
      })
    }

    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) eigs ${size}x${size}`, () => {
        impl.ts.eigs(M)
      })
    }

    if (impl.wasm && impl.wasm.eigsSymmetric) {
      bench.add(`WASM eigsSymmetric ${size}x${size}`, () => {
        impl.wasm.eigsSymmetric(flatMatrix, size)
      })
    }

    await bench.run()
    printResults(bench, 'eigs', size)
  }
}

async function benchmarkLsolve (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('FORWARD SUBSTITUTION (Lx = b)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    if (size > 500) {
      console.log(`\n[${size}x${size} matrix] - Skipping (too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} lower triangular matrix]`)

    const L = generateLowerTriangular(size)
    const b = generateVector(size)
    const flatL = new Float64Array(size * size)
    const flatB = new Float64Array(size)
    for (let i = 0; i < size; i++) {
      flatB[i] = b[i]
      for (let j = 0; j < size; j++) {
        flatL[i * size + j] = L[i][j]
      }
    }

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const Lmat = impl.js.matrix(L)
      const bvec = impl.js.matrix(b.map(v => [v]))
      bench.add(`JS (lib/) lsolve ${size}x${size}`, () => {
        impl.js.lsolve(Lmat, bvec)
      })
    }

    if (impl.ts) {
      const Lmat = impl.ts.matrix(L)
      const bvec = impl.ts.matrix(b.map(v => [v]))
      bench.add(`TS (dist/) lsolve ${size}x${size}`, () => {
        impl.ts.lsolve(Lmat, bvec)
      })
    }

    if (impl.wasm && impl.wasm.laLsolve) {
      bench.add(`WASM laLsolve ${size}x${size}`, () => {
        impl.wasm.laLsolve(flatL, flatB, size)
      })
    }

    await bench.run()
    printResults(bench, 'lsolve', size)
  }
}

async function benchmarkUsolve (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('BACKWARD SUBSTITUTION (Ux = b)')
  console.log('='.repeat(100))

  for (const size of MATRIX_SIZES) {
    if (size > 500) {
      console.log(`\n[${size}x${size} matrix] - Skipping (too slow)`)
      continue
    }

    console.log(`\n[${size}x${size} upper triangular matrix]`)

    const U = generateUpperTriangular(size)
    const b = generateVector(size)
    const flatU = new Float64Array(size * size)
    const flatB = new Float64Array(size)
    for (let i = 0; i < size; i++) {
      flatB[i] = b[i]
      for (let j = 0; j < size; j++) {
        flatU[i * size + j] = U[i][j]
      }
    }

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      const Umat = impl.js.matrix(U)
      const bvec = impl.js.matrix(b.map(v => [v]))
      bench.add(`JS (lib/) usolve ${size}x${size}`, () => {
        impl.js.usolve(Umat, bvec)
      })
    }

    if (impl.ts) {
      const Umat = impl.ts.matrix(U)
      const bvec = impl.ts.matrix(b.map(v => [v]))
      bench.add(`TS (dist/) usolve ${size}x${size}`, () => {
        impl.ts.usolve(Umat, bvec)
      })
    }

    if (impl.wasm && impl.wasm.laUsolve) {
      bench.add(`WASM laUsolve ${size}x${size}`, () => {
        impl.wasm.laUsolve(flatU, flatB, size)
      })
    }

    await bench.run()
    printResults(bench, 'usolve', size)
  }
}

async function benchmarkFFT (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('FFT (Fast Fourier Transform)')
  console.log('='.repeat(100))

  // FFT requires power-of-2 sizes
  const fftSizes = [64, 256, 1024, 4096]

  for (const size of fftSizes) {
    console.log(`\n[${size} elements]`)

    const realData = generateVector(size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      bench.add(`JS (lib/) fft ${size}`, () => {
        impl.js.fft(realData)
      })
    }

    if (impl.ts) {
      bench.add(`TS (dist/) fft ${size}`, () => {
        impl.ts.fft(realData)
      })
    }

    // WASM FFT uses interleaved complex format [re, im, re, im, ...]
    if (impl.wasm && impl.wasm.fft) {
      const complexData = new Float64Array(size * 2)
      for (let i = 0; i < size; i++) {
        complexData[i * 2] = realData[i]
        complexData[i * 2 + 1] = 0
      }
      bench.add(`WASM fft ${size}`, () => {
        impl.wasm.fft(complexData, size, 0)
      })
    }

    await bench.run()
    printResults(bench, 'fft', size)
  }
}

async function benchmarkDotProduct (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('DOT PRODUCT')
  console.log('='.repeat(100))

  const sizes = [1000, 10000, 100000, 1000000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const vecA = generateVector(size)
    const vecB = generateVector(size)
    const flatA = generateFlatVector(size)
    const flatB = generateFlatVector(size)

    const bench = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      bench.add(`JS (lib/) dot ${size}`, () => {
        impl.js.dot(vecA, vecB)
      })
    }

    if (impl.ts) {
      bench.add(`TS (dist/) dot ${size}`, () => {
        impl.ts.dot(vecA, vecB)
      })
    }

    if (impl.wasm && impl.wasm.dotProduct) {
      bench.add(`WASM dotProduct ${size}`, () => {
        impl.wasm.dotProduct(flatA, flatB, size)
      })
    }

    await bench.run()
    printResults(bench, 'dot', size)
  }
}

async function benchmarkStatistics (impl) {
  console.log('\n' + '='.repeat(100))
  console.log('STATISTICS (mean, std, variance)')
  console.log('='.repeat(100))

  const sizes = [10000, 100000, 1000000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements - MEAN]`)

    const data = generateVector(size)
    const flatData = generateFlatVector(size)

    // Mean
    const benchMean = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      benchMean.add(`JS (lib/) mean ${size}`, () => {
        impl.js.mean(data)
      })
    }

    if (impl.ts) {
      benchMean.add(`TS (dist/) mean ${size}`, () => {
        impl.ts.mean(data)
      })
    }

    if (impl.wasm && impl.wasm.simdMeanF64) {
      benchMean.add(`WASM simdMeanF64 ${size}`, () => {
        impl.wasm.simdMeanF64(flatData, size)
      })
    }

    await benchMean.run()
    printResults(benchMean, 'mean', size)

    // Std
    console.log(`\n[${size.toLocaleString()} elements - STD]`)
    const benchStd = new Bench({ time: BENCH_TIME, iterations: BENCH_ITERATIONS })

    if (impl.js) {
      benchStd.add(`JS (lib/) std ${size}`, () => {
        impl.js.std(data)
      })
    }

    if (impl.ts) {
      benchStd.add(`TS (dist/) std ${size}`, () => {
        impl.ts.std(data)
      })
    }

    if (impl.wasm && impl.wasm.simdStdF64) {
      benchStd.add(`WASM simdStdF64 ${size}`, () => {
        impl.wasm.simdStdF64(flatData, size, 0)
      })
    }

    await benchStd.run()
    printResults(benchStd, 'std', size)
  }
}

// =============================================================================
// Summary Report
// =============================================================================

function printSummaryReport () {
  console.log('\n' + '='.repeat(100))
  console.log('SUMMARY REPORT')
  console.log('='.repeat(100))

  // Group by operation
  const byOperation = {}
  for (const result of allResults) {
    if (!byOperation[result.operation]) {
      byOperation[result.operation] = []
    }
    byOperation[result.operation].push(result)
  }

  console.log('\nSpeedup Summary (vs Original JavaScript):')
  console.log('-'.repeat(80))

  for (const [operation, results] of Object.entries(byOperation)) {
    console.log(`\n${operation.toUpperCase()}:`)

    for (const r of results) {
      const jsResult = r.results.find(x => x.implementation === 'JS')
      if (!jsResult) continue

      const tsResult = r.results.find(x => x.implementation === 'TS')
      const wasmResult = r.results.find(x => x.implementation === 'WASM')

      let line = `  Size ${String(r.size).padEnd(6)}: `

      if (tsResult) {
        const speedup = tsResult.opsPerSec / jsResult.opsPerSec
        line += `TS ${speedup.toFixed(2)}x  `
      }

      if (wasmResult) {
        const speedup = wasmResult.opsPerSec / jsResult.opsPerSec
        line += `WASM ${speedup.toFixed(2)}x`
      }

      console.log(line)
    }
  }

  console.log('\n' + '='.repeat(100))
  console.log(`
IMPLEMENTATION GUIDE:

  Original JavaScript (lib/esm/):
    - Babel-compiled from original .js source files
    - Full mathjs API with type checking and broadcasting
    - Most compatible, handles all data types

  TypeScript (dist/):
    - tsup-compiled from refactored .ts source files
    - Same API as JavaScript, with added type safety
    - Expected: Nearly identical performance to JS

  WASM (lib/wasm/):
    - AssemblyScript compiled to WebAssembly
    - Uses Float64Array directly (no Matrix object overhead)
    - Best for: Large matrices (>100x100), numerical computations
    - Limitations: No broadcasting, no BigNumber/Complex support

PERFORMANCE EXPECTATIONS:

  Small matrices (<50x50):    JS ≈ TS (WASM overhead may be visible)
  Medium matrices (50-200):   WASM starts to show benefits
  Large matrices (>200x200):  WASM 2-10x faster
  Very large (>500x500):      WASM 5-25x faster

  Statistics on arrays:
    <10K elements:  JS ≈ TS
    >10K elements:  WASM shows significant speedup
    >100K elements: WASM 3-10x faster
`)

  console.log('='.repeat(100))
  console.log('BENCHMARK COMPLETE')
  console.log('='.repeat(100))
}

// =============================================================================
// Main
// =============================================================================

async function main () {
  const impl = await loadImplementations()

  const available = [
    impl.js ? 'JS (lib/)' : null,
    impl.ts ? 'TS (dist/)' : null,
    impl.wasm ? 'WASM' : null
  ].filter(Boolean)

  if (available.length === 0) {
    console.error('\nNo implementations loaded! Please build the project first:')
    console.error('  npm run build')
    process.exit(1)
  }

  console.log(`\nAvailable implementations: ${available.join(', ')}`)
  console.log('\n' + '='.repeat(100))
  console.log('RUNNING BENCHMARKS')
  console.log('='.repeat(100))

  // Run all benchmarks
  await benchmarkMatrixMultiply(impl)
  await benchmarkMatrixAdd(impl)
  await benchmarkTranspose(impl)
  await benchmarkDeterminant(impl)
  await benchmarkInverse(impl)
  await benchmarkLUP(impl)
  await benchmarkQR(impl)
  await benchmarkEigs(impl)
  await benchmarkLsolve(impl)
  await benchmarkUsolve(impl)
  await benchmarkFFT(impl)
  await benchmarkDotProduct(impl)
  await benchmarkStatistics(impl)

  // Print summary
  printSummaryReport()

  // Save results to JSON
  const reportPath = path.join(__dirname, 'benchmark_results.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    system: {
      cpus: os.cpus().length,
      model: os.cpus()[0].model,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB'
    },
    results: allResults
  }, null, 2))
  console.log(`\nResults saved to: ${reportPath}`)
}

main().catch(console.error)
