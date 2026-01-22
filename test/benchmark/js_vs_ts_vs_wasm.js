/**
 * Comprehensive Benchmark: Original JavaScript vs TypeScript vs WASM
 *
 * Compares performance across three implementation tiers:
 * 1. JavaScript (lib/esm/) - Original Babel-compiled JS implementation
 * 2. TypeScript (dist/) - TypeScript refactored, tsup-compiled implementation
 * 3. WASM (lib/wasm/) - AssemblyScript WebAssembly accelerated implementation
 *
 * Run with: node test/benchmark/js_vs_ts_vs_wasm.js
 */

import { Bench } from 'tinybench'
import os from 'os'

console.log('='.repeat(90))
console.log('BENCHMARK: Original JavaScript (lib/) vs TypeScript (dist/) vs WASM')
console.log('='.repeat(90))
console.log(`\nSystem: ${os.cpus().length} CPUs (${os.cpus()[0].model})`)
console.log(`Node.js: ${process.version}`)
console.log(`Platform: ${process.platform} ${process.arch}`)
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
    console.log('  [OK] JavaScript loaded - functions:', typeof implementations.js.add)
  } catch (error) {
    console.log(`  [FAIL] JavaScript: ${error.message}`)
  }

  // 2. TypeScript implementation (dist)
  console.log('Loading TypeScript (dist/index.js)...')
  try {
    const tsModule = await import('../../dist/index.js')
    implementations.ts = tsModule.default
    console.log('  [OK] TypeScript loaded - functions:', typeof implementations.ts.add)
  } catch (error) {
    console.log(`  [FAIL] TypeScript: ${error.message}`)
  }

  // 3. WASM implementation
  console.log('Loading WASM (lib/wasm/index.js)...')
  try {
    implementations.wasm = await import('../../lib/wasm/index.js')
    console.log('  [OK] WASM loaded - functions:', typeof implementations.wasm.multiplyDense)

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

// =============================================================================
// Format Results
// =============================================================================

function formatResult (task) {
  const result = task.result
  if (!result) return `  ${task.name}: No result`
  if (!result.hz) return `  ${task.name}: Error - ${result.error || 'Unknown error'}`

  const opsPerSec = result.hz.toFixed(2)
  const meanMs = (result.mean * 1000).toFixed(3)
  const samples = result.samples ? result.samples.length : 0

  return `  ${task.name.padEnd(45)} ${opsPerSec.padStart(12)} ops/sec  ${meanMs.padStart(10)} ms/op  (${samples} samples)`
}

function printSpeedups (bench) {
  const jsTask = bench.tasks.find(t => t.name.includes('JS (lib/)'))
  if (!jsTask || !jsTask.result || !jsTask.result.hz) return

  const jsHz = jsTask.result.hz
  console.log('\n  Speedups vs Original JavaScript (lib/):')

  for (const task of bench.tasks) {
    if (task === jsTask) continue
    if (task.result && task.result.hz) {
      const speedup = task.result.hz / jsHz
      const label = speedup >= 1
        ? `${speedup.toFixed(2)}x faster`
        : `${(1 / speedup).toFixed(2)}x slower`
      console.log(`    ${task.name}: ${label}`)
    }
  }
}

// =============================================================================
// Benchmark Suites
// =============================================================================

async function benchmarkMatrixMultiply (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX MULTIPLICATION (A * B)')
  console.log('-'.repeat(90))

  const sizes = [25, 50, 100, 200]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices]`)

    // Pre-generate test data
    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 5 })

    // Original JavaScript (lib/esm)
    if (impl.js) {
      const mathJs = impl.js
      const A = mathJs.matrix(matrixA)
      const B = mathJs.matrix(matrixB)
      bench.add(`JS (lib/) multiply ${size}x${size}`, () => {
        mathJs.multiply(A, B)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const mathTs = impl.ts
      const A = mathTs.matrix(matrixA)
      const B = mathTs.matrix(matrixB)
      bench.add(`TS (dist/) multiply ${size}x${size}`, () => {
        mathTs.multiply(A, B)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM multiplyDense ${size}x${size}`, () => {
        impl.wasm.multiplyDense(flatA, size, size, flatB, size, size)
      })
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.multiplyDenseSIMD) {
      bench.add(`WASM+SIMD multiply ${size}x${size}`, () => {
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

async function benchmarkDotProduct (impl) {
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

    // Original JavaScript (lib/esm)
    if (impl.js) {
      bench.add(`JS (lib/) dot ${size}`, () => {
        impl.js.dot(vecA, vecB)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      bench.add(`TS (dist/) dot ${size}`, () => {
        impl.ts.dot(vecA, vecB)
      })
    }

    // WASM
    if (impl.wasm) {
      bench.add(`WASM dotProduct ${size}`, () => {
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

async function benchmarkTranspose (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX TRANSPOSE')
  console.log('-'.repeat(90))

  const sizes = [100, 250, 500]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrix]`)

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // Original JavaScript (lib/esm)
    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) transpose ${size}`, () => {
        impl.js.transpose(M)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) transpose ${size}`, () => {
        impl.ts.transpose(M)
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

async function benchmarkAdd (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX ADDITION (A + B)')
  console.log('-'.repeat(90))

  const sizes = [100, 500, 1000]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices = ${(size * size).toLocaleString()} elements]`)

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 10 })

    // Original JavaScript (lib/esm)
    if (impl.js) {
      const A = impl.js.matrix(matrixA)
      const B = impl.js.matrix(matrixB)
      bench.add(`JS (lib/) add ${size}x${size}`, () => {
        impl.js.add(A, B)
      })
    }

    // TypeScript (dist)
    if (impl.ts) {
      const A = impl.ts.matrix(matrixA)
      const B = impl.ts.matrix(matrixB)
      bench.add(`TS (dist/) add ${size}x${size}`, () => {
        impl.ts.add(A, B)
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

async function benchmarkStatistics (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('STATISTICS (mean, std)')
  console.log('-'.repeat(90))

  const sizes = [10000, 100000, 1000000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements - MEAN]`)

    const data = generateVector(size)
    const flatData = generateFlatVector(size)

    const benchMean = new Bench({ time: 3000, iterations: 10 })

    // Original JavaScript mean
    if (impl.js) {
      benchMean.add(`JS (lib/) mean ${size}`, () => {
        impl.js.mean(data)
      })
    }

    // TypeScript mean
    if (impl.ts) {
      benchMean.add(`TS (dist/) mean ${size}`, () => {
        impl.ts.mean(data)
      })
    }

    // WASM SIMD mean
    if (impl.wasm && impl.wasm.simdMeanF64) {
      benchMean.add(`WASM+SIMD mean ${size}`, () => {
        impl.wasm.simdMeanF64(flatData, size)
      })
    }

    await benchMean.run()
    for (const task of benchMean.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(benchMean)

    // STD benchmark
    console.log(`\n[${size.toLocaleString()} elements - STD]`)
    const benchStd = new Bench({ time: 3000, iterations: 10 })

    // Original JavaScript std
    if (impl.js) {
      benchStd.add(`JS (lib/) std ${size}`, () => {
        impl.js.std(data)
      })
    }

    // TypeScript std
    if (impl.ts) {
      benchStd.add(`TS (dist/) std ${size}`, () => {
        impl.ts.std(data)
      })
    }

    // WASM SIMD std
    if (impl.wasm && impl.wasm.simdStdF64) {
      benchStd.add(`WASM+SIMD std ${size}`, () => {
        impl.wasm.simdStdF64(flatData, size, 0)
      })
    }

    await benchStd.run()
    for (const task of benchStd.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(benchStd)
  }
}

async function benchmarkDeterminant (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('DETERMINANT')
  console.log('-'.repeat(90))

  const sizes = [10, 25, 50]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrix]`)

    // Generate a random matrix
    const matrix = generateMatrix(size, size)
    // eslint-disable-next-line no-unused-vars
    const flatMatrix = generateFlatMatrix(size, size)

    const bench = new Bench({ time: 3000, iterations: 5 })

    // Original JavaScript det
    if (impl.js) {
      const M = impl.js.matrix(matrix)
      bench.add(`JS (lib/) det ${size}`, () => {
        impl.js.det(M)
      })
    }

    // TypeScript det
    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      bench.add(`TS (dist/) det ${size}`, () => {
        impl.ts.det(M)
      })
    }

    // Note: WASM luDecomposition returns internal ref, would need wrapper for det

    await bench.run()
    for (const task of bench.tasks) {
      console.log(formatResult(task))
    }
    printSpeedups(bench)
  }
}

async function benchmarkExpressionParser (impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('EXPRESSION PARSER')
  console.log('-'.repeat(90))

  const expressions = [
    { name: 'simple', expr: '2 + 3 * 4' },
    { name: 'trig', expr: 'sin(x)^2 + cos(x)^2' },
    { name: 'matrix', expr: '[1,2,3] + [4,5,6]' },
    { name: 'complex', expr: '(2+3i) * (4-5i)' }
  ]

  for (const { name, expr } of expressions) {
    console.log(`\n[Expression: "${expr}"]`)

    const bench = new Bench({ time: 3000, iterations: 20 })

    // Original JavaScript evaluate
    if (impl.js) {
      const scope = { x: 0.5 }
      bench.add(`JS (lib/) eval "${name}"`, () => {
        impl.js.evaluate(expr, scope)
      })
    }

    // TypeScript evaluate
    if (impl.ts) {
      const scope = { x: 0.5 }
      bench.add(`TS (dist/) eval "${name}"`, () => {
        impl.ts.evaluate(expr, scope)
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
  console.log('\n' + '='.repeat(90))
  console.log('RUNNING BENCHMARKS')
  console.log('='.repeat(90))

  await benchmarkMatrixMultiply(impl)
  await benchmarkDotProduct(impl)
  await benchmarkTranspose(impl)
  await benchmarkAdd(impl)
  await benchmarkStatistics(impl)
  await benchmarkDeterminant(impl)
  await benchmarkExpressionParser(impl)

  // Summary
  console.log('\n' + '='.repeat(90))
  console.log('SUMMARY')
  console.log('='.repeat(90))
  console.log(`
Implementation Sources:
  - JS (lib/)   : lib/esm/  - Original JavaScript, Babel-compiled
  - TS (dist/)  : dist/     - TypeScript refactored, tsup-compiled
  - WASM        : lib/wasm/ - AssemblyScript WebAssembly

Expected Behavior:
  - JS vs TS should be nearly identical (both compile to JavaScript)
  - WASM should be faster for compute-heavy operations on typed arrays
  - WASM overhead may make it slower for small operations or complex objects

Performance Hierarchy:

  Small ops (< 1000 elements):  JS ≈ TS > WASM (JS/TS wins due to low overhead)
  Large ops (> 10000 elements): WASM+SIMD > WASM > JS ≈ TS (WASM amortizes overhead)
  Expression parsing:           JS ≈ TS (pure JavaScript, no WASM equivalent)

Notes:
  - WASM uses Float64Array directly (no Matrix object overhead)
  - JS/TS use Matrix objects with type checking and broadcasting
  - Fair comparison should consider API differences
`)

  console.log('='.repeat(90))
  console.log('BENCHMARK COMPLETE')
  console.log('='.repeat(90))
}

main().catch(console.error)
