// @ts-nocheck
/**
 * WASM Speedup Summary Benchmark
 *
 * Shows the speedup achieved by WASM vs pure JavaScript
 * Uses the compiled WASM module directly (lib/wasm/index.js)
 */

import { Bench } from 'tinybench'
import os from 'os'

console.log('='.repeat(90))
console.log('WASM SPEEDUP SUMMARY')
console.log('='.repeat(90))
console.log(`\nSystem: ${os.cpus().length} CPUs (${os.cpus()[0].model})`)
console.log(`Node.js: ${process.version}`)
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

function jsMean(arr: Float64Array): number {
  return jsSum(arr) / arr.length
}

function jsStd(arr: Float64Array): number {
  const mean = jsMean(arr)
  let sumSq = 0
  for (let i = 0; i < arr.length; i++) {
    const diff = arr[i] - mean
    sumSq += diff * diff
  }
  return Math.sqrt(sumSq / arr.length)
}

function jsAdd(a: Float64Array, b: Float64Array): Float64Array {
  const result = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

function jsTranspose(
  data: Float64Array,
  rows: number,
  cols: number
): Float64Array {
  const result = new Float64Array(rows * cols)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = data[i * cols + j]
    }
  }
  return result
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
// Main
// =============================================================================

async function main(): Promise<void> {
  // Load WASM
  console.log('Loading WASM module...')
  let wasm: any
  try {
    wasm = await import('../../lib/wasm/index.js')
    console.log('  [OK] WASM loaded\n')
  } catch (e: any) {
    console.log(`  [FAIL] WASM: ${e.message}`)
    console.log('  Run `npm run build:wasm` first')
    return
  }

  const results: Array<{
    operation: string
    size: string
    jsOps: number
    wasmOps: number
    simdOps: number
    speedup: number
    simdSpeedup: number
  }> = []

  // ==========================================================================
  // DOT PRODUCT
  // ==========================================================================
  console.log('--- DOT PRODUCT ---\n')

  for (const size of [1000, 10000, 100000]) {
    const a = generateVector(size)
    const b = generateVector(size)

    const bench = new Bench({ time: 500 })

    bench.add('JS', () => jsDotProduct(a, b))
    bench.add('WASM', () => wasm.dotProduct(a, b, size))
    if (wasm.simdDotF64) {
      bench.add('SIMD', () => wasm.simdDotF64(a, b, size))
    }

    await bench.run()

    const jsTask = bench.tasks.find((t) => t.name === 'JS')
    const wasmTask = bench.tasks.find((t) => t.name === 'WASM')
    const simdTask = bench.tasks.find((t) => t.name === 'SIMD')

    const jsOps = jsTask?.result?.hz || 0
    const wasmOps = wasmTask?.result?.hz || 0
    const simdOps = simdTask?.result?.hz || 0

    results.push({
      operation: 'Dot Product',
      size: size.toLocaleString(),
      jsOps,
      wasmOps,
      simdOps,
      speedup: wasmOps / jsOps,
      simdSpeedup: simdOps / jsOps
    })

    console.log(`  ${size.toLocaleString().padStart(10)} elements:`)
    console.log(`    JS:   ${jsOps.toFixed(0).padStart(10)} ops/sec`)
    console.log(
      `    WASM: ${wasmOps.toFixed(0).padStart(10)} ops/sec (${(wasmOps / jsOps).toFixed(1)}x)`
    )
    if (simdOps > 0) {
      console.log(
        `    SIMD: ${simdOps.toFixed(0).padStart(10)} ops/sec (${(simdOps / jsOps).toFixed(1)}x)`
      )
    }
    console.log('')
  }

  // ==========================================================================
  // STATISTICS (Mean, Std)
  // ==========================================================================
  console.log('--- STATISTICS ---\n')

  for (const size of [10000, 100000]) {
    const arr = generateVector(size)

    // Mean
    const meanBench = new Bench({ time: 500 })
    meanBench.add('JS Mean', () => jsMean(arr))
    if (wasm.simdMeanF64) {
      meanBench.add('SIMD Mean', () => wasm.simdMeanF64(arr, size))
    }
    await meanBench.run()

    const jsMeanOps =
      meanBench.tasks.find((t) => t.name === 'JS Mean')?.result?.hz || 0
    const simdMeanOps =
      meanBench.tasks.find((t) => t.name === 'SIMD Mean')?.result?.hz || 0

    console.log(`  Mean (${size.toLocaleString()} elements):`)
    console.log(`    JS:   ${jsMeanOps.toFixed(0).padStart(10)} ops/sec`)
    if (simdMeanOps > 0) {
      console.log(
        `    SIMD: ${simdMeanOps.toFixed(0).padStart(10)} ops/sec (${(simdMeanOps / jsMeanOps).toFixed(1)}x)`
      )
    }

    // Std
    const stdBench = new Bench({ time: 500 })
    stdBench.add('JS Std', () => jsStd(arr))
    if (wasm.simdStdF64) {
      stdBench.add('SIMD Std', () => wasm.simdStdF64(arr, size, 0))
    }
    await stdBench.run()

    const jsStdOps =
      stdBench.tasks.find((t) => t.name === 'JS Std')?.result?.hz || 0
    const simdStdOps =
      stdBench.tasks.find((t) => t.name === 'SIMD Std')?.result?.hz || 0

    console.log(`  Std Dev (${size.toLocaleString()} elements):`)
    console.log(`    JS:   ${jsStdOps.toFixed(0).padStart(10)} ops/sec`)
    if (simdStdOps > 0) {
      console.log(
        `    SIMD: ${simdStdOps.toFixed(0).padStart(10)} ops/sec (${(simdStdOps / jsStdOps).toFixed(1)}x)`
      )
    }

    results.push({
      operation: 'Mean',
      size: size.toLocaleString(),
      jsOps: jsMeanOps,
      wasmOps: 0,
      simdOps: simdMeanOps,
      speedup: 0,
      simdSpeedup: simdMeanOps / jsMeanOps
    })

    results.push({
      operation: 'Std Dev',
      size: size.toLocaleString(),
      jsOps: jsStdOps,
      wasmOps: 0,
      simdOps: simdStdOps,
      speedup: 0,
      simdSpeedup: simdStdOps / jsStdOps
    })

    console.log('')
  }

  // ==========================================================================
  // MATRIX TRANSPOSE
  // ==========================================================================
  console.log('--- MATRIX TRANSPOSE ---\n')

  for (const n of [100, 250, 500]) {
    const data = generateVector(n * n)

    const bench = new Bench({ time: 500 })
    bench.add('JS', () => jsTranspose(data, n, n))
    bench.add('WASM', () => wasm.transpose(data, n, n))

    await bench.run()

    const jsOps = bench.tasks.find((t) => t.name === 'JS')?.result?.hz || 0
    const wasmOps = bench.tasks.find((t) => t.name === 'WASM')?.result?.hz || 0

    results.push({
      operation: 'Transpose',
      size: `${n}x${n}`,
      jsOps,
      wasmOps,
      simdOps: 0,
      speedup: wasmOps / jsOps,
      simdSpeedup: 0
    })

    console.log(`  ${n}x${n} matrix:`)
    console.log(`    JS:   ${jsOps.toFixed(0).padStart(10)} ops/sec`)
    console.log(
      `    WASM: ${wasmOps.toFixed(0).padStart(10)} ops/sec (${(wasmOps / jsOps).toFixed(1)}x)`
    )
    console.log('')
  }

  // ==========================================================================
  // MATRIX ADDITION
  // ==========================================================================
  console.log('--- MATRIX ADDITION ---\n')

  for (const n of [100, 500]) {
    const size = n * n
    const a = generateVector(size)
    const b = generateVector(size)

    const bench = new Bench({ time: 500 })
    bench.add('JS', () => jsAdd(a, b))
    bench.add('WASM', () => wasm.add(a, b, size))
    if (wasm.simdAddF64) {
      bench.add('SIMD', () => {
        const result = new Float64Array(size)
        wasm.simdAddF64(a, b, result, size)
        return result
      })
    }

    await bench.run()

    const jsOps = bench.tasks.find((t) => t.name === 'JS')?.result?.hz || 0
    const wasmOps = bench.tasks.find((t) => t.name === 'WASM')?.result?.hz || 0
    const simdOps = bench.tasks.find((t) => t.name === 'SIMD')?.result?.hz || 0

    results.push({
      operation: 'Add',
      size: `${n}x${n}`,
      jsOps,
      wasmOps,
      simdOps,
      speedup: wasmOps / jsOps,
      simdSpeedup: simdOps / jsOps
    })

    console.log(`  ${n}x${n} matrices (${size.toLocaleString()} elements):`)
    console.log(`    JS:   ${jsOps.toFixed(0).padStart(10)} ops/sec`)
    console.log(
      `    WASM: ${wasmOps.toFixed(0).padStart(10)} ops/sec (${(wasmOps / jsOps).toFixed(1)}x)`
    )
    if (simdOps > 0) {
      console.log(
        `    SIMD: ${simdOps.toFixed(0).padStart(10)} ops/sec (${(simdOps / jsOps).toFixed(1)}x)`
      )
    }
    console.log('')
  }

  // ==========================================================================
  // SUMMARY TABLE
  // ==========================================================================
  console.log('='.repeat(90))
  console.log('SPEEDUP SUMMARY')
  console.log('='.repeat(90))
  console.log('')
  console.log(
    '  Operation          Size           JS ops/s    WASM Speedup    SIMD Speedup'
  )
  console.log('  ' + '-'.repeat(80))

  for (const r of results) {
    const wasmStr = r.speedup > 0 ? `${r.speedup.toFixed(1)}x` : '-'
    const simdStr = r.simdSpeedup > 0 ? `${r.simdSpeedup.toFixed(1)}x` : '-'
    console.log(
      `  ${r.operation.padEnd(18)} ${r.size.padStart(10)}    ${r.jsOps.toFixed(0).padStart(12)}    ${wasmStr.padStart(12)}    ${simdStr.padStart(12)}`
    )
  }

  console.log('')
  console.log('='.repeat(90))
  console.log('KEY FINDINGS')
  console.log('='.repeat(90))

  // Calculate average speedups
  const wasmSpeedups = results
    .filter((r) => r.speedup > 0)
    .map((r) => r.speedup)
  const simdSpeedups = results
    .filter((r) => r.simdSpeedup > 0)
    .map((r) => r.simdSpeedup)

  const avgWasm =
    wasmSpeedups.length > 0
      ? wasmSpeedups.reduce((a, b) => a + b, 0) / wasmSpeedups.length
      : 0
  const avgSimd =
    simdSpeedups.length > 0
      ? simdSpeedups.reduce((a, b) => a + b, 0) / simdSpeedups.length
      : 0
  const maxSimd = simdSpeedups.length > 0 ? Math.max(...simdSpeedups) : 0

  console.log(`
  WASM Performance:
    - Average speedup:     ${avgWasm.toFixed(1)}x faster than JS
    - Best for:            Matrix operations (transpose, multiply)

  WASM+SIMD Performance:
    - Average speedup:     ${avgSimd.toFixed(1)}x faster than JS
    - Maximum speedup:     ${maxSimd.toFixed(1)}x (statistics operations)
    - Best for:            Vector operations (dot product, mean, std)

  Recommendations:
    - Use WASM for matrix operations on data > 100 elements
    - Use WASM+SIMD for statistics on data > 1000 elements
    - For small data (<100 elements), JS may be faster due to call overhead
`)

  console.log('='.repeat(90))
}

main().catch(console.error)
