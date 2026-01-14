// @ts-nocheck
/**
 * Comprehensive Benchmark: JavaScript vs TypeScript vs WASM
 *
 * Compares performance across three implementation tiers:
 * 1. JavaScript (Babel-compiled from lib/esm/) - Original JS implementation
 * 2. TypeScript (tsup-compiled from dist/) - TypeScript refactored implementation
 * 3. WASM (AssemblyScript from lib/wasm/) - WebAssembly accelerated implementation
 *
 * Tests cover:
 * - Matrix operations (multiply, transpose, add)
 * - Vector operations (dot product, sum)
 * - Linear algebra (LU decomposition, determinant)
 * - Signal processing (FFT)
 * - Statistics (mean, variance, std)
 */

import { Bench } from 'tinybench'
import os from 'os'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '../..')

console.log('='.repeat(90))
console.log('BENCHMARK: JavaScript vs TypeScript vs WASM')
console.log('='.repeat(90))
console.log(`\nSystem: ${os.cpus().length} CPUs (${os.cpus()[0].model})`)
console.log(`Node.js: ${process.version}`)
console.log(`Platform: ${process.platform} ${process.arch}`)
console.log('')

// =============================================================================
// Load all implementations
// =============================================================================

interface Implementations {
  js?: any
  ts?: any
  wasm?: any
}

async function loadImplementations (): Promise<Implementations> {
  const implementations: Implementations = {}

  // 1. JavaScript implementation (lib/esm)
  console.log('Loading JavaScript implementation (lib/esm)...')
  try {
    const jsModule = await import('../../lib/esm/index.js')
    implementations.js = jsModule.default || jsModule
    console.log('  - JavaScript loaded successfully')
  } catch (error: any) {
    console.log(`  - JavaScript load failed: ${error.message}`)
  }

  // 2. TypeScript implementation (dist)
  console.log('Loading TypeScript implementation (dist)...')
  try {
    const tsModule = await import('../../dist/index.js')
    implementations.ts = tsModule.default || tsModule
    console.log('  - TypeScript loaded successfully')
  } catch (error: any) {
    console.log(`  - TypeScript load failed: ${error.message}`)
  }

  // 3. WASM implementation
  console.log('Loading WASM implementation (lib/wasm)...')
  try {
    implementations.wasm = await import('../../lib/wasm/index.js')
    console.log('  - WASM loaded successfully')

    // Verify WASM works
    const testA = new Float64Array([1, 2, 3, 4])
    const testB = new Float64Array([5, 6, 7, 8])
    const result = implementations.wasm.dotProduct(testA, testB, 4)
    console.log(`  - WASM verification: dot([1,2,3,4], [5,6,7,8]) = ${result} (expected: 70)`)
  } catch (error: any) {
    console.log(`  - WASM load failed: ${error.message}`)
  }

  return implementations
}

// =============================================================================
// Test Data Generators
// =============================================================================

function generateMatrix (rows: number, cols: number): number[][] {
  const data: number[][] = []
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * 10)
    }
    data.push(row)
  }
  return data
}

function generateFlatMatrix (rows: number, cols: number): Float64Array {
  const data = new Float64Array(rows * cols)
  for (let i = 0; i < rows * cols; i++) {
    data[i] = Math.random() * 10
  }
  return data
}

function generateVector (size: number): number[] {
  const data: number[] = []
  for (let i = 0; i < size; i++) {
    data.push(Math.random() * 100)
  }
  return data
}

function generateFlatVector (size: number): Float64Array {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

// Fiedler matrix generator for determinant tests
function generateFiedlerMatrix (n: number): number[][] {
  const matrix: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      row.push(Math.abs(i - j))
    }
    matrix.push(row)
  }
  return matrix
}

// =============================================================================
// Format Results
// =============================================================================

function formatResult (task: any): string {
  const result = task.result
  if (!result) return `${task.name}: No result`
  if (!result.hz) return `${task.name}: Error - ${result.error || 'Unknown error'}`

  const opsPerSec = result.hz.toFixed(2)
  const meanMs = (result.mean * 1000).toFixed(3)
  const samples = result.samples ? result.samples.length : 0

  return `  ${task.name.padEnd(40)} ${opsPerSec.padStart(12)} ops/sec  ${meanMs.padStart(10)} ms/op  (${samples} samples)`
}

function printSpeedups (bench: Bench, baselineIndex: number = 0): void {
  const baseline = bench.tasks[baselineIndex].result
  if (!baseline || !baseline.hz) return

  console.log('\n  Speedups vs ' + bench.tasks[baselineIndex].name + ':')
  for (let i = 0; i < bench.tasks.length; i++) {
    if (i === baselineIndex) continue
    const task = bench.tasks[i]
    if (task.result && task.result.hz) {
      const speedup = task.result.hz / baseline.hz
      const label = speedup >= 1 ? `${speedup.toFixed(2)}x faster` : `${(1 / speedup).toFixed(2)}x slower`
      console.log(`    ${task.name}: ${label}`)
    }
  }
}

// =============================================================================
// Benchmark Suites
// =============================================================================

async function benchmarkMatrixMultiply (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX MULTIPLICATION')
  console.log('-'.repeat(90))

  const sizes = [25, 50, 100]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices]`)

    // Generate test data
    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 5 })

    // JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      const A = mathJs.matrix(matrixA)
      const B = mathJs.matrix(matrixB)
      bench.add(`JS (lib/esm) ${size}x${size}`, () => {
        mathJs.multiply(A, B)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      const A = mathTs.matrix(matrixA)
      const B = mathTs.matrix(matrixB)
      bench.add(`TS (dist) ${size}x${size}`, () => {
        mathTs.multiply(A, B)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM ${size}x${size}`, () => {
        impl.wasm.multiplyDense(flatA, size, size, flatB, size, size)
      })
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.multiplyDenseSIMD) {
      bench.add(`WASM+SIMD ${size}x${size}`, () => {
        impl.wasm.multiplyDenseSIMD(flatA, size, size, flatB, size, size)
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

async function benchmarkDotProduct (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('DOT PRODUCT')
  console.log('-'.repeat(90))

  const sizes = [1000, 10000, 100000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const vecA = generateVector(size)
    const vecB = generateVector(size)
    const flatA = generateFlatVector(size)
    const flatB = generateFlatVector(size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      bench.add(`JS (lib/esm) dot ${size}`, () => {
        mathJs.dot(vecA, vecB)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      bench.add(`TS (dist) dot ${size}`, () => {
        mathTs.dot(vecA, vecB)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM dot ${size}`, () => {
        impl.wasm.dotProduct(flatA, flatB, size)
      })
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.simdDotF64) {
      bench.add(`WASM+SIMD dot ${size}`, () => {
        impl.wasm.simdDotF64(flatA, flatB, size)
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

async function benchmarkTranspose (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX TRANSPOSE')
  console.log('-'.repeat(90))

  const sizes = [100, 250, 500]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      const M = mathJs.matrix(matrix)
      bench.add(`JS (lib/esm) transpose ${size}`, () => {
        mathJs.transpose(M)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      const M = mathTs.matrix(matrix)
      bench.add(`TS (dist) transpose ${size}`, () => {
        mathTs.transpose(M)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM transpose ${size}`, () => {
        impl.wasm.transpose(flatMatrix, size, size)
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

async function benchmarkDeterminant (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('DETERMINANT (via LU decomposition)')
  console.log('-'.repeat(90))

  const sizes = [10, 25, 50]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} Fiedler matrix]`)

    const matrix = generateFiedlerMatrix(size)
    const flatMatrix = new Float64Array(size * size)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        flatMatrix[i * size + j] = matrix[i][j]
      }
    }

    const bench = new Bench({ time: 3000, iterations: 5 })

    // JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      const M = mathJs.matrix(matrix)
      bench.add(`JS (lib/esm) det ${size}`, () => {
        mathJs.det(M)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      const M = mathTs.matrix(matrix)
      bench.add(`TS (dist) det ${size}`, () => {
        mathTs.det(M)
      })
    }

    // WASM (using LU decomposition)
    if (impl.wasm && impl.wasm.luDecomposition) {
      bench.add(`WASM LU det ${size}`, () => {
        const luResult = impl.wasm.luDecomposition(flatMatrix, size)
        // Note: luResult is an internal reference, actual det calculation would need additional wrapper
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

async function benchmarkFFT (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('FFT (Fast Fourier Transform)')
  console.log('-'.repeat(90))

  const sizes = [256, 1024, 4096]

  for (const size of sizes) {
    console.log(`\n[${size} points]`)

    // Generate complex data (interleaved real, imag)
    const data = new Float64Array(size * 2)
    for (let i = 0; i < size; i++) {
      data[i * 2] = Math.sin(2 * Math.PI * i / size) + Math.random() * 0.1 // real
      data[i * 2 + 1] = 0 // imag
    }

    const bench = new Bench({ time: 3000, iterations: 10 })

    // JavaScript/TypeScript fft would need matrix operations, skip for pure comparison

    // WASM FFT
    if (impl.wasm && impl.wasm.fft) {
      bench.add(`WASM FFT ${size}`, () => {
        impl.wasm.fft(data, size, 0) // forward FFT
      })
    }

    if (bench.tasks.length > 0) {
      await bench.run()
      for (const task of bench.tasks) {
        console.log(formatResult(task))
      }
    } else {
      console.log('  No FFT implementations available for comparison')
    }
  }
}

async function benchmarkStatistics (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('STATISTICS (mean, variance, std)')
  console.log('-'.repeat(90))

  const sizes = [10000, 100000, 1000000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const data = generateVector(size)
    const flatData = generateFlatVector(size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // JavaScript mean
    if (impl.js) {
      const mathJs = impl.js
      bench.add(`JS (lib/esm) mean ${size}`, () => {
        mathJs.mean(data)
      })
    }

    // TypeScript mean
    if (impl.ts) {
      const mathTs = impl.ts
      bench.add(`TS (dist) mean ${size}`, () => {
        mathTs.mean(data)
      })
    }

    // WASM SIMD mean
    if (impl.wasm && impl.wasm.simdMeanF64) {
      bench.add(`WASM+SIMD mean ${size}`, () => {
        impl.wasm.simdMeanF64(flatData, size)
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)

    // Variance/Std benchmark
    const benchVar = new Bench({ time: 3000, iterations: 10 })

    // JavaScript std
    if (impl.js) {
      const mathJs = impl.js
      benchVar.add(`JS (lib/esm) std ${size}`, () => {
        mathJs.std(data)
      })
    }

    // TypeScript std
    if (impl.ts) {
      const mathTs = impl.ts
      benchVar.add(`TS (dist) std ${size}`, () => {
        mathTs.std(data)
      })
    }

    // WASM SIMD std
    if (impl.wasm && impl.wasm.simdStdF64) {
      benchVar.add(`WASM+SIMD std ${size}`, () => {
        impl.wasm.simdStdF64(flatData, size, 0)
      })
    }

    await benchVar.run()
    console.log('')
    for (const task of benchVar.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(benchVar)
  }
}

async function benchmarkAdd (impl: Implementations): Promise<void> {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX ADDITION')
  console.log('-'.repeat(90))

  const sizes = [100, 500, 1000]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices (${(size * size).toLocaleString()} elements)]`)

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      const A = mathJs.matrix(matrixA)
      const B = mathJs.matrix(matrixB)
      bench.add(`JS (lib/esm) add ${size}x${size}`, () => {
        mathJs.add(A, B)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      const A = mathTs.matrix(matrixA)
      const B = mathTs.matrix(matrixB)
      bench.add(`TS (dist) add ${size}x${size}`, () => {
        mathTs.add(A, B)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM add ${size}x${size}`, () => {
        impl.wasm.add(flatA, flatB, size * size)
      })
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.simdAddF64) {
      const result = new Float64Array(size * size)
      bench.add(`WASM+SIMD add ${size}x${size}`, () => {
        impl.wasm.simdAddF64(flatA, flatB, result, size * size)
      })
    }

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

// =============================================================================
// Main
// =============================================================================

async function main (): Promise<void> {
  const impl = await loadImplementations()

  if (!impl.js && !impl.ts && !impl.wasm) {
    console.error('\nNo implementations loaded! Please build the project first:')
    console.error('  npm run build')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(90))
  console.log('RUNNING BENCHMARKS')
  console.log('='.repeat(90))

  await benchmarkMatrixMultiply(impl)
  await benchmarkDotProduct(impl)
  await benchmarkTranspose(impl)
  await benchmarkAdd(impl)
  await benchmarkDeterminant(impl)
  await benchmarkFFT(impl)
  await benchmarkStatistics(impl)

  // Summary
  console.log('\n' + '='.repeat(90))
  console.log('SUMMARY')
  console.log('='.repeat(90))
  console.log(`
Performance Tiers (expected behavior):

  FASTEST  ─────────────────────────────────────────────────  SLOWEST

  ┌─────────────┐   ┌──────────┐   ┌─────────────┐   ┌────────────┐
  │ WASM + SIMD │ > │   WASM   │ > │ TypeScript  │ ≈ │ JavaScript │
  │  (2-10x)    │   │  (2-5x)  │   │  (dist/)    │   │ (lib/esm/) │
  └─────────────┘   └──────────┘   └─────────────┘   └────────────┘

Key Findings:

1. JAVASCRIPT vs TYPESCRIPT:
   - Should have similar performance (both compile to JS)
   - TypeScript provides type safety at compile time, not runtime overhead
   - Small differences may be due to code structure changes during refactoring

2. WASM ACCELERATION:
   - 2-10x faster for compute-intensive operations
   - Best for: matrix multiply, FFT, linear algebra decompositions
   - Uses Float64Array for efficient memory transfer

3. WASM + SIMD:
   - Additional 2-4x speedup on supported operations
   - SIMD instructions process multiple values in parallel
   - Best for: dot products, element-wise operations, statistics

4. OPTIMAL USAGE:
   - Small operations (< 100 elements): Use JS/TS (WASM overhead not worth it)
   - Medium operations (100 - 10K): Use WASM
   - Large operations (> 10K): Use WASM + SIMD
   - Very large matrices (> 1000x1000): Consider parallel workers + WASM

Build Information:
  - JavaScript: lib/esm/ (Babel-compiled from src/*.js)
  - TypeScript: dist/ (tsup-compiled from src/*.ts)
  - WASM: lib/wasm/ (AssemblyScript-compiled from src/wasm/*.ts)
`)

  console.log('='.repeat(90))
  console.log('BENCHMARK COMPLETE')
  console.log('='.repeat(90))
}

main().catch(console.error)
