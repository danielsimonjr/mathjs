// @ts-nocheck
/**
 * Parallel WASM Benchmark
 *
 * Compares performance across four implementation tiers:
 * 1. Pure JavaScript - baseline
 * 2. WASM - single-threaded WebAssembly
 * 3. WASM+SIMD - single-threaded with SIMD vectorization
 * 4. Parallel - multi-threaded with SharedArrayBuffer
 *
 * Note: The wrapped WASM functions (lib/wasm/index.js) handle memory
 * management internally, so we call them with TypedArrays directly.
 */

import { Bench } from 'tinybench'
import os from 'os'
import {
  ParallelWasm,
  ParallelWasmThresholds
} from '../../src/parallel/ParallelWasm.ts'
import { MathWorkerPool } from '../../src/parallel/WorkerPool.ts'

const NUM_CPUS = os.cpus().length

console.log('='.repeat(90))
console.log('PARALLEL WASM BENCHMARK')
console.log('Comparing: JS vs WASM vs WASM+SIMD vs Parallel')
console.log('='.repeat(90))
console.log(`\nSystem: ${NUM_CPUS} CPUs (${os.cpus()[0].model})`)
console.log(`Node.js: ${process.version}`)
console.log(
  `SharedArrayBuffer: ${typeof SharedArrayBuffer !== 'undefined' ? 'Available' : 'Not available'}`
)
console.log('')

// =============================================================================
// Pure JavaScript implementations
// =============================================================================

function jsDotProduct(a: Float64Array, b: Float64Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

function jsSum(arr: Float64Array): number {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum
}

function jsAdd(a: Float64Array, b: Float64Array): Float64Array {
  const result = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

function jsMean(arr: Float64Array): number {
  return jsSum(arr) / arr.length
}

// =============================================================================
// Test Data Generators
// =============================================================================

function generateVector(size: number): Float64Array {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

// =============================================================================
// Benchmark Helpers
// =============================================================================

interface BenchResult {
  name: string
  opsPerSec: number
  avgMs: number
}

function formatResult(result: BenchResult): string {
  return `  ${result.name.padEnd(40)} ${result.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${result.avgMs.toFixed(3).padStart(10)} ms/op`
}

function formatSpeedup(baseline: number, current: number): string {
  const speedup = current / baseline
  if (speedup >= 1) {
    return `${speedup.toFixed(2)}x faster`
  } else {
    return `${(1 / speedup).toFixed(2)}x slower`
  }
}

// =============================================================================
// Main Benchmark
// =============================================================================

async function runBenchmarks(): Promise<void> {
  // Load wrapped WASM module (handles memory internally)
  console.log('Loading WASM module...')
  let wasm: any = null
  try {
    wasm = await import('../../lib/wasm/index.js')
    console.log('  [OK] WASM loaded')
    console.log(
      `       Available functions: ${Object.keys(wasm)
        .filter((k) => typeof wasm[k] === 'function')
        .join(', ')}`
    )
  } catch (e: any) {
    console.log(`  [FAIL] WASM: ${e.message}`)
    console.log('  Run `npm run build:wasm` first')
    return
  }

  // Initialize Parallel WASM
  console.log('Initializing Parallel WASM...')
  try {
    await ParallelWasm.initWasm()
    console.log('  [OK] Parallel WASM ready')
  } catch (e) {
    console.log('  [FAIL] Parallel WASM not available')
  }

  console.log('')
  console.log('Parallel WASM Thresholds:')
  console.log(
    `  - WASM threshold (dotProduct): ${ParallelWasmThresholds.wasm.dotProduct} elements`
  )
  console.log(
    `  - Parallel threshold (dotProduct): ${ParallelWasmThresholds.parallel.dotProduct} elements`
  )
  console.log(
    `  - Parallel threshold (elementWise): ${ParallelWasmThresholds.parallel.elementWise} elements`
  )
  console.log(
    `  - Parallel threshold (statistics): ${ParallelWasmThresholds.parallel.statistics} elements`
  )
  console.log('')

  // ==========================================================================
  // DOT PRODUCT BENCHMARK
  // ==========================================================================
  console.log('\n' + '='.repeat(90))
  console.log('DOT PRODUCT BENCHMARK')
  console.log('='.repeat(90))

  const dotSizes = [1000, 10000, 50000, 100000, 500000, 1000000]

  for (const size of dotSizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const a = generateVector(size)
    const b = generateVector(size)

    const bench = new Bench({ time: 1000, iterations: 3 })

    // JS baseline
    bench.add('JS dot product', () => {
      jsDotProduct(a, b)
    })

    // WASM (if available) - wrapped function takes arrays directly
    if (wasm?.dotProduct) {
      bench.add('WASM dot product', () => {
        wasm.dotProduct(a, b, size)
      })
    }

    // WASM+SIMD (if available)
    if (wasm?.simdDotF64) {
      bench.add('WASM+SIMD dot product', () => {
        wasm.simdDotF64(a, b, size)
      })
    }

    // Parallel (uses auto-selection internally)
    bench.add('Parallel dot product', async () => {
      await ParallelWasm.dotProduct(a, b)
    })

    await bench.run()

    // Print results
    const results: BenchResult[] = bench.tasks.map((task) => ({
      name: task.name,
      opsPerSec: task.result?.hz || 0,
      avgMs: task.result?.mean ? task.result.mean * 1000 : 0
    }))

    results.forEach((r) => console.log(formatResult(r)))

    // Calculate speedups
    const jsResult = results.find((r) => r.name.includes('JS'))
    if (jsResult) {
      console.log('\n  Speedups vs JS:')
      results
        .filter((r) => !r.name.includes('JS'))
        .forEach((r) => {
          console.log(
            `    ${r.name}: ${formatSpeedup(jsResult.opsPerSec, r.opsPerSec)}`
          )
        })
    }
  }

  // ==========================================================================
  // SUM BENCHMARK
  // ==========================================================================
  console.log('\n' + '='.repeat(90))
  console.log('SUM BENCHMARK')
  console.log('='.repeat(90))

  const sumSizes = [10000, 100000, 500000, 1000000]

  for (const size of sumSizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const arr = generateVector(size)

    const bench = new Bench({ time: 1000, iterations: 3 })

    // JS baseline
    bench.add('JS sum', () => {
      jsSum(arr)
    })

    // WASM+SIMD (if available)
    if (wasm?.simdSumF64) {
      bench.add('WASM+SIMD sum', () => {
        wasm.simdSumF64(arr, size)
      })
    }

    // Parallel
    bench.add('Parallel sum', async () => {
      await ParallelWasm.sum(arr)
    })

    await bench.run()

    const results: BenchResult[] = bench.tasks.map((task) => ({
      name: task.name,
      opsPerSec: task.result?.hz || 0,
      avgMs: task.result?.mean ? task.result.mean * 1000 : 0
    }))

    results.forEach((r) => console.log(formatResult(r)))

    const jsResult = results.find((r) => r.name.includes('JS'))
    if (jsResult) {
      console.log('\n  Speedups vs JS:')
      results
        .filter((r) => !r.name.includes('JS'))
        .forEach((r) => {
          console.log(
            `    ${r.name}: ${formatSpeedup(jsResult.opsPerSec, r.opsPerSec)}`
          )
        })
    }
  }

  // ==========================================================================
  // ELEMENT-WISE ADDITION BENCHMARK
  // ==========================================================================
  console.log('\n' + '='.repeat(90))
  console.log('ELEMENT-WISE ADDITION BENCHMARK')
  console.log('='.repeat(90))

  const addSizes = [10000, 50000, 100000, 500000, 1000000]

  for (const size of addSizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const a = generateVector(size)
    const b = generateVector(size)

    const bench = new Bench({ time: 1000, iterations: 3 })

    // JS baseline
    bench.add('JS add', () => {
      jsAdd(a, b)
    })

    // WASM (if available)
    if (wasm?.add) {
      bench.add('WASM add', () => {
        wasm.add(a, b, size)
      })
    }

    // WASM+SIMD (if available)
    if (wasm?.simdAddF64) {
      bench.add('WASM+SIMD add', () => {
        const result = new Float64Array(size)
        wasm.simdAddF64(a, b, result, size)
        return result
      })
    }

    // Parallel
    bench.add('Parallel add', async () => {
      await ParallelWasm.add(a, b)
    })

    await bench.run()

    const results: BenchResult[] = bench.tasks.map((task) => ({
      name: task.name,
      opsPerSec: task.result?.hz || 0,
      avgMs: task.result?.mean ? task.result.mean * 1000 : 0
    }))

    results.forEach((r) => console.log(formatResult(r)))

    const jsResult = results.find((r) => r.name.includes('JS'))
    if (jsResult) {
      console.log('\n  Speedups vs JS:')
      results
        .filter((r) => !r.name.includes('JS'))
        .forEach((r) => {
          console.log(
            `    ${r.name}: ${formatSpeedup(jsResult.opsPerSec, r.opsPerSec)}`
          )
        })
    }
  }

  // ==========================================================================
  // EXECUTION PLAN DISPLAY
  // ==========================================================================
  console.log('\n' + '='.repeat(90))
  console.log('EXECUTION STRATEGY BY SIZE')
  console.log('='.repeat(90))
  console.log('\nParallelWasm automatically selects the optimal strategy:')
  console.log('')
  console.log('  Size          Dot Product    Element-wise   Statistics')
  console.log('  ' + '-'.repeat(60))

  const testSizes = [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]
  for (const size of testSizes) {
    const dotPlan = ParallelWasm.getExecutionPlan(size, 'dotProduct')
    const elemPlan = ParallelWasm.getExecutionPlan(size, 'elementWise')
    const statPlan = ParallelWasm.getExecutionPlan(size, 'statistics')

    console.log(
      `  ${size.toLocaleString().padStart(10)}    ${dotPlan.strategy.padEnd(14)} ${elemPlan.strategy.padEnd(14)} ${statPlan.strategy}`
    )
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n' + '='.repeat(90))
  console.log('SUMMARY')
  console.log('='.repeat(90))
  console.log(`
Performance Tiers:
  1. JS           - Baseline JavaScript implementation
  2. WASM         - Single-threaded WebAssembly (1-5x faster)
  3. WASM+SIMD    - Single-threaded with SIMD vectors (10-100x faster for large data)
  4. Parallel     - Multi-threaded with SharedArrayBuffer

Automatic Strategy Selection:
  - Small data (<${ParallelWasmThresholds.wasm.dotProduct} elements): JS (no copy overhead)
  - Medium data: WASM or WASM+SIMD (best single-thread performance)
  - Large data (>${ParallelWasmThresholds.parallel.dotProduct.toLocaleString()} elements): Parallel

System Configuration:
  - CPUs: ${NUM_CPUS}
  - Parallel Workers: ${NUM_CPUS - 1} (leaving 1 for main thread)
  - SharedArrayBuffer: ${typeof SharedArrayBuffer !== 'undefined' ? 'Enabled' : 'Disabled'}
`)

  // Cleanup
  await ParallelWasm.terminate()
  await MathWorkerPool.terminateGlobal()

  console.log('='.repeat(90))
  console.log('BENCHMARK COMPLETE')
  console.log('='.repeat(90))
}

runBenchmarks().catch(console.error)
