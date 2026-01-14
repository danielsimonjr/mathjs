/**
 * Comprehensive Benchmark: Original JavaScript vs TypeScript vs WASM
 *
 * Compares performance across three implementation tiers:
 * 1. JavaScript (lib/cjs/) - Original Babel-compiled JS implementation
 * 2. TypeScript (dist/) - TypeScript refactored, tsup-compiled implementation
 * 3. WASM (lib/wasm/) - AssemblyScript WebAssembly accelerated implementation
 *
 * Run with: node test/benchmark/js_vs_ts_vs_wasm.cjs
 */

const os = require('os')

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

async function loadImplementations() {
  const implementations = {}

  // 1. Original JavaScript implementation (lib/cjs)
  console.log('Loading Original JavaScript (lib/cjs/)...')
  try {
    const jsModule = require('../../lib/cjs/defaultInstance.js')
    implementations.js = jsModule.default
    console.log('  [OK] JavaScript loaded - functions:', typeof implementations.js.add)
  } catch (error) {
    console.log(`  [FAIL] JavaScript: ${error.message}`)
  }

  // 2. TypeScript implementation (dist)
  console.log('Loading TypeScript (dist/)...')
  try {
    const tsModule = await import('../../dist/index.js')
    implementations.ts = tsModule.default
    console.log('  [OK] TypeScript loaded - functions:', typeof implementations.ts.add)
  } catch (error) {
    console.log(`  [FAIL] TypeScript: ${error.message}`)
  }

  // 3. WASM implementation
  console.log('Loading WASM (lib/wasm/)...')
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

function generateMatrix(rows, cols) {
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

function generateFlatMatrix(rows, cols) {
  const data = new Float64Array(rows * cols)
  for (let i = 0; i < rows * cols; i++) {
    data[i] = Math.random() * 10
  }
  return data
}

function generateVector(size) {
  const data = []
  for (let i = 0; i < size; i++) {
    data.push(Math.random() * 100)
  }
  return data
}

function generateFlatVector(size) {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

// =============================================================================
// Simple Benchmark Runner
// =============================================================================

async function runBenchmark(name, fn, iterations = 100, warmup = 10) {
  // Warmup
  for (let i = 0; i < warmup; i++) {
    fn()
  }

  // Timed runs
  const times = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  times.sort((a, b) => a - b)
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const median = times[Math.floor(times.length / 2)]
  const min = times[0]
  const max = times[times.length - 1]
  const opsPerSec = 1000 / avg

  return { name, avg, median, min, max, opsPerSec, iterations }
}

function formatResult(result) {
  return `  ${result.name.padEnd(50)} ${result.opsPerSec.toFixed(2).padStart(12)} ops/sec  ${result.avg.toFixed(3).padStart(10)} ms/op`
}

function printSpeedups(results) {
  const jsResult = results.find(r => r.name.includes('JS (lib/)'))
  if (!jsResult) return

  console.log('\n  Speedups vs Original JavaScript (lib/):')
  for (const result of results) {
    if (result === jsResult) continue
    const speedup = result.opsPerSec / jsResult.opsPerSec
    const label = speedup >= 1
      ? `${speedup.toFixed(2)}x faster`
      : `${(1/speedup).toFixed(2)}x slower`
    console.log(`    ${result.name}: ${label}`)
  }
}

// =============================================================================
// Benchmark Suites
// =============================================================================

async function benchmarkMatrixMultiply(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX MULTIPLICATION (A * B)')
  console.log('-'.repeat(90))

  const sizes = [25, 50, 100]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices]`)
    const results = []

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    // Original JavaScript (lib/cjs)
    if (impl.js) {
      const A = impl.js.matrix(matrixA)
      const B = impl.js.matrix(matrixB)
      results.push(await runBenchmark(`JS (lib/) multiply ${size}x${size}`, () => {
        impl.js.multiply(A, B)
      }, 50, 5))
    }

    // TypeScript (dist)
    if (impl.ts) {
      const A = impl.ts.matrix(matrixA)
      const B = impl.ts.matrix(matrixB)
      results.push(await runBenchmark(`TS (dist/) multiply ${size}x${size}`, () => {
        impl.ts.multiply(A, B)
      }, 50, 5))
    }

    // WASM
    if (impl.wasm) {
      results.push(await runBenchmark(`WASM multiplyDense ${size}x${size}`, () => {
        impl.wasm.multiplyDense(flatA, size, size, flatB, size, size)
      }, 50, 5))
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.multiplyDenseSIMD) {
      results.push(await runBenchmark(`WASM+SIMD multiply ${size}x${size}`, () => {
        impl.wasm.multiplyDenseSIMD(flatA, size, size, flatB, size, size)
      }, 50, 5))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkDotProduct(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('DOT PRODUCT')
  console.log('-'.repeat(90))

  const sizes = [1000, 10000, 100000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)
    const results = []

    const vecA = generateVector(size)
    const vecB = generateVector(size)
    const flatA = generateFlatVector(size)
    const flatB = generateFlatVector(size)

    // Original JavaScript (lib/cjs)
    if (impl.js) {
      results.push(await runBenchmark(`JS (lib/) dot ${size}`, () => {
        impl.js.dot(vecA, vecB)
      }, 100, 10))
    }

    // TypeScript (dist)
    if (impl.ts) {
      results.push(await runBenchmark(`TS (dist/) dot ${size}`, () => {
        impl.ts.dot(vecA, vecB)
      }, 100, 10))
    }

    // WASM
    if (impl.wasm) {
      results.push(await runBenchmark(`WASM dotProduct ${size}`, () => {
        impl.wasm.dotProduct(flatA, flatB, size)
      }, 100, 10))
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.simdDotF64) {
      results.push(await runBenchmark(`WASM+SIMD dot ${size}`, () => {
        impl.wasm.simdDotF64(flatA, flatB, size)
      }, 100, 10))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkTranspose(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX TRANSPOSE')
  console.log('-'.repeat(90))

  const sizes = [100, 250, 500]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrix]`)
    const results = []

    const matrix = generateMatrix(size, size)
    const flatMatrix = generateFlatMatrix(size, size)

    // Original JavaScript (lib/cjs)
    if (impl.js) {
      const M = impl.js.matrix(matrix)
      results.push(await runBenchmark(`JS (lib/) transpose ${size}`, () => {
        impl.js.transpose(M)
      }, 100, 10))
    }

    // TypeScript (dist)
    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      results.push(await runBenchmark(`TS (dist/) transpose ${size}`, () => {
        impl.ts.transpose(M)
      }, 100, 10))
    }

    // WASM
    if (impl.wasm) {
      results.push(await runBenchmark(`WASM transpose ${size}`, () => {
        impl.wasm.transpose(flatMatrix, size, size)
      }, 100, 10))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkAdd(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('MATRIX ADDITION (A + B)')
  console.log('-'.repeat(90))

  const sizes = [100, 500]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrices = ${(size * size).toLocaleString()} elements]`)
    const results = []

    const matrixA = generateMatrix(size, size)
    const matrixB = generateMatrix(size, size)
    const flatA = generateFlatMatrix(size, size)
    const flatB = generateFlatMatrix(size, size)

    // Original JavaScript (lib/cjs)
    if (impl.js) {
      const A = impl.js.matrix(matrixA)
      const B = impl.js.matrix(matrixB)
      results.push(await runBenchmark(`JS (lib/) add ${size}x${size}`, () => {
        impl.js.add(A, B)
      }, 100, 10))
    }

    // TypeScript (dist)
    if (impl.ts) {
      const A = impl.ts.matrix(matrixA)
      const B = impl.ts.matrix(matrixB)
      results.push(await runBenchmark(`TS (dist/) add ${size}x${size}`, () => {
        impl.ts.add(A, B)
      }, 100, 10))
    }

    // WASM
    if (impl.wasm) {
      results.push(await runBenchmark(`WASM add ${size}x${size}`, () => {
        impl.wasm.add(flatA, flatB, size * size)
      }, 100, 10))
    }

    // WASM SIMD
    if (impl.wasm && impl.wasm.simdAddF64) {
      const result = new Float64Array(size * size)
      results.push(await runBenchmark(`WASM+SIMD add ${size}x${size}`, () => {
        impl.wasm.simdAddF64(flatA, flatB, result, size * size)
      }, 100, 10))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkStatistics(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('STATISTICS (mean, std)')
  console.log('-'.repeat(90))

  const sizes = [10000, 100000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements - MEAN]`)
    let results = []

    const data = generateVector(size)
    const flatData = generateFlatVector(size)

    // Original JavaScript mean
    if (impl.js) {
      results.push(await runBenchmark(`JS (lib/) mean ${size}`, () => {
        impl.js.mean(data)
      }, 100, 10))
    }

    // TypeScript mean
    if (impl.ts) {
      results.push(await runBenchmark(`TS (dist/) mean ${size}`, () => {
        impl.ts.mean(data)
      }, 100, 10))
    }

    // WASM SIMD mean
    if (impl.wasm && impl.wasm.simdMeanF64) {
      results.push(await runBenchmark(`WASM+SIMD mean ${size}`, () => {
        impl.wasm.simdMeanF64(flatData, size)
      }, 100, 10))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)

    // STD benchmark
    console.log(`\n[${size.toLocaleString()} elements - STD]`)
    results = []

    // Original JavaScript std
    if (impl.js) {
      results.push(await runBenchmark(`JS (lib/) std ${size}`, () => {
        impl.js.std(data)
      }, 100, 10))
    }

    // TypeScript std
    if (impl.ts) {
      results.push(await runBenchmark(`TS (dist/) std ${size}`, () => {
        impl.ts.std(data)
      }, 100, 10))
    }

    // WASM SIMD std
    if (impl.wasm && impl.wasm.simdStdF64) {
      results.push(await runBenchmark(`WASM+SIMD std ${size}`, () => {
        impl.wasm.simdStdF64(flatData, size, 0)
      }, 100, 10))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkDeterminant(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('DETERMINANT')
  console.log('-'.repeat(90))

  const sizes = [10, 25, 50]

  for (const size of sizes) {
    console.log(`\n[${size}x${size} matrix]`)
    const results = []

    const matrix = generateMatrix(size, size)

    // Original JavaScript det
    if (impl.js) {
      const M = impl.js.matrix(matrix)
      results.push(await runBenchmark(`JS (lib/) det ${size}`, () => {
        impl.js.det(M)
      }, 50, 5))
    }

    // TypeScript det
    if (impl.ts) {
      const M = impl.ts.matrix(matrix)
      results.push(await runBenchmark(`TS (dist/) det ${size}`, () => {
        impl.ts.det(M)
      }, 50, 5))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

async function benchmarkExpressionParser(impl) {
  console.log('\n' + '-'.repeat(90))
  console.log('EXPRESSION PARSER')
  console.log('-'.repeat(90))

  const expressions = [
    { name: 'simple', expr: '2 + 3 * 4' },
    { name: 'trig', expr: 'sin(x)^2 + cos(x)^2' },
    { name: 'matrix', expr: '[1,2,3] + [4,5,6]' }
  ]

  for (const { name, expr } of expressions) {
    console.log(`\n[Expression: "${expr}"]`)
    const results = []

    // Original JavaScript evaluate
    if (impl.js) {
      const scope = { x: 0.5 }
      results.push(await runBenchmark(`JS (lib/) eval "${name}"`, () => {
        impl.js.evaluate(expr, scope)
      }, 200, 20))
    }

    // TypeScript evaluate
    if (impl.ts) {
      const scope = { x: 0.5 }
      results.push(await runBenchmark(`TS (dist/) eval "${name}"`, () => {
        impl.ts.evaluate(expr, scope)
      }, 200, 20))
    }

    for (const result of results) {
      console.log(formatResult(result))
    }
    printSpeedups(results)
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
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
  - JS (lib/)   : lib/cjs/  - Original JavaScript, Babel-compiled
  - TS (dist/)  : dist/     - TypeScript refactored, tsup-compiled
  - WASM        : lib/wasm/ - AssemblyScript WebAssembly

Expected Behavior:
  - JS vs TS: Nearly identical (both compile to JavaScript)
  - WASM: Faster for compute-heavy ops on typed arrays, overhead for small ops

Notes:
  - WASM uses Float64Array directly (no Matrix object overhead)
  - JS/TS use Matrix objects with type checking and broadcasting
`)

  console.log('='.repeat(90))
  console.log('BENCHMARK COMPLETE')
  console.log('='.repeat(90))
}

main().catch(console.error)
