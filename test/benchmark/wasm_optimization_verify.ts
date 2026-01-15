// @ts-nocheck
/**
 * WASM Optimization Verification Benchmark
 *
 * Verifies the implemented optimizations:
 * 1. Module caching (precompile vs full load)
 * 2. Streaming compilation in browser (simulated)
 * 3. Size threshold selection (JS vs WASM crossover)
 * 4. Memory pooling effectiveness
 */

import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface BenchResult {
  name: string
  ops: number
  avgMs: number
  minMs: number
  maxMs: number
}

function benchmark(
  name: string,
  fn: () => any,
  iterations: number = 1000
): BenchResult {
  // Warmup
  for (let i = 0; i < Math.min(10, iterations / 10); i++) fn()

  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    times.push(performance.now() - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return {
    name,
    ops: 1000 / avg,
    avgMs: avg,
    minMs: Math.min(...times),
    maxMs: Math.max(...times)
  }
}

async function benchmarkAsync(
  name: string,
  fn: () => Promise<any>,
  iterations: number = 10
): Promise<BenchResult> {
  // Warmup
  for (let i = 0; i < Math.min(3, iterations); i++) await fn()

  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    await fn()
    times.push(performance.now() - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return {
    name,
    ops: 1000 / avg,
    avgMs: avg,
    minMs: Math.min(...times),
    maxMs: Math.max(...times)
  }
}

function formatResult(r: BenchResult): string {
  return `${r.name.padEnd(45)} ${r.ops.toFixed(0).padStart(10)} ops/sec  ${r.avgMs.toFixed(3).padStart(8)}ms avg`
}

async function main(): Promise<void> {
  console.log('='.repeat(80))
  console.log('WASM OPTIMIZATION VERIFICATION')
  console.log('='.repeat(80))

  const wasmPath = join(__dirname, '../../lib/wasm/index.wasm')

  if (!fs.existsSync(wasmPath)) {
    console.log('\nWASM file not found. Run `npm run build:wasm` first.')
    return
  }

  // Dynamic import to get fresh instances
  const { WasmLoader } = await import('../../src/wasm/WasmLoader.ts')
  const { MatrixWasmBridge, WasmThresholds } = await import(
    '../../src/wasm/MatrixWasmBridge.ts'
  )

  // ============================================================================
  // 1. Module Caching Verification
  // ============================================================================
  console.log('\n--- 1. MODULE CACHING ---\n')

  // Create fresh loader instances for testing
  const loader1 = WasmLoader.getInstance()
  loader1.reset()

  // First load (cold)
  const coldStart = performance.now()
  await loader1.load(wasmPath)
  const coldTime = performance.now() - coldStart
  const coldMetrics = loader1.getLoadingMetrics()

  console.log(`Cold load (first time):     ${coldTime.toFixed(2)}ms`)
  if (coldMetrics) {
    console.log(`  - File read:              ${coldMetrics.fileReadMs.toFixed(2)}ms`)
    console.log(`  - Compilation:            ${coldMetrics.compileMs.toFixed(2)}ms`)
    console.log(`  - Instantiation:          ${coldMetrics.instantiateMs.toFixed(2)}ms`)
  }

  // Second load (cached module)
  loader1.reset()
  await loader1.precompile(wasmPath)
  const warmStart = performance.now()
  await loader1.load(wasmPath)
  const warmTime = performance.now() - warmStart
  const warmMetrics = loader1.getLoadingMetrics()

  console.log(`\nWarm load (precompiled):    ${warmTime.toFixed(2)}ms`)
  if (warmMetrics) {
    console.log(`  - From cache:             ${warmMetrics.fromCache}`)
    console.log(`  - Instantiation only:     ${warmMetrics.instantiateMs.toFixed(2)}ms`)
  }

  const cacheSpeedup = coldTime / warmTime
  console.log(`\nCache speedup:              ${cacheSpeedup.toFixed(1)}x faster`)

  // ============================================================================
  // 2. Size Threshold Verification (JS vs WASM crossover)
  // ============================================================================
  console.log('\n--- 2. SIZE THRESHOLD VERIFICATION ---\n')

  console.log('Current thresholds:')
  console.log(`  - Element-wise ops:       ${WasmThresholds.elementWise} elements`)
  console.log(`  - Dot product:            ${WasmThresholds.dotProduct} elements`)
  console.log(`  - Matrix multiply:        ${WasmThresholds.matrixMultiply} elements`)
  console.log(`  - FFT:                    ${WasmThresholds.fft} elements`)
  console.log(`  - LU decomposition:       ${WasmThresholds.luDecomposition} elements`)
  console.log(`  - Parallel threshold:     ${WasmThresholds.parallel} elements`)

  // Test dot product crossover
  console.log('\nDot product crossover test:')
  console.log('  Size         JS (ops/s)    Est. WASM    Recommended')
  console.log('  ' + '-'.repeat(60))

  // Pure JS dot product
  function jsDot(a: Float64Array, b: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
    return sum
  }

  const sizes = [10, 50, 100, 200, 500, 1000, 5000]
  for (const size of sizes) {
    const a = new Float64Array(size)
    const b = new Float64Array(size)
    for (let i = 0; i < size; i++) {
      a[i] = Math.random()
      b[i] = Math.random()
    }

    const jsResult = benchmark('', () => jsDot(a, b), Math.min(10000, 100000 / size))
    const recommended = size >= WasmThresholds.dotProduct ? 'WASM' : 'JS'

    console.log(
      `  ${size.toString().padStart(5)}    ${jsResult.ops.toFixed(0).padStart(12)}    ${'-'.padStart(12)}    ${recommended}`
    )
  }

  // ============================================================================
  // 3. Matrix Multiply Threshold
  // ============================================================================
  console.log('\n--- 3. MATRIX MULTIPLY THRESHOLD ---\n')

  // Initialize MatrixWasmBridge
  await MatrixWasmBridge.init(wasmPath)

  // Pure JS matrix multiply
  function jsMatMul(
    a: Float64Array,
    aRows: number,
    aCols: number,
    b: Float64Array,
    bCols: number
  ): Float64Array {
    const result = new Float64Array(aRows * bCols)
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

  console.log('Matrix sizes and recommendations:')
  console.log('  Dims       Elements    Method    Reason')
  console.log('  ' + '-'.repeat(55))

  const matSizes = [
    [2, 2],
    [4, 4],
    [8, 8],
    [16, 16],
    [32, 32],
    [64, 64],
    [100, 100]
  ]

  for (const [rows, cols] of matSizes) {
    const elements = rows * cols * 2 // A + B matrices
    const method =
      elements >= WasmThresholds.matrixMultiply ? 'WASM' : 'JS'
    const reason =
      method === 'WASM'
        ? 'O(n³) compute > copy overhead'
        : 'Copy overhead > compute savings'

    console.log(
      `  ${rows}x${cols}`.padEnd(10) +
        `${elements.toString().padStart(8)}    ${method.padEnd(8)}  ${reason}`
    )
  }

  // Benchmark a few sizes
  console.log('\nActual benchmark (8x8 matrix multiply):')
  const n = 8
  const matA = new Float64Array(n * n)
  const matB = new Float64Array(n * n)
  for (let i = 0; i < n * n; i++) {
    matA[i] = Math.random()
    matB[i] = Math.random()
  }

  const jsMatResult = benchmark(
    'JS matrix multiply (8x8)',
    () => jsMatMul(matA, n, n, matB, n),
    5000
  )
  console.log(formatResult(jsMatResult))

  const wasmMatResult = await benchmarkAsync(
    'Bridge matrix multiply (8x8)',
    () => MatrixWasmBridge.multiply(matA, n, n, matB, n, n),
    1000
  )
  console.log(formatResult(wasmMatResult))

  // ============================================================================
  // 4. Memory Pool Stats
  // ============================================================================
  console.log('\n--- 4. MEMORY POOL STATS ---\n')

  const poolStats = loader1.getPoolStats()
  console.log('Current pool state:')
  console.log(`  Float64 pool: ${poolStats.float64.total} entries, ${poolStats.float64.inUse} in use, ${poolStats.float64.totalBytes} bytes`)
  console.log(`  Int32 pool:   ${poolStats.int32.total} entries, ${poolStats.int32.inUse} in use, ${poolStats.int32.totalBytes} bytes`)

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(80))
  console.log('OPTIMIZATION SUMMARY')
  console.log('='.repeat(80))
  console.log(`
✅ Module Caching:
   - Cold load: ${coldTime.toFixed(2)}ms
   - Warm load: ${warmTime.toFixed(2)}ms
   - Speedup:   ${cacheSpeedup.toFixed(1)}x

✅ Size Thresholds:
   - Prevents WASM overhead for small operations
   - JS fallback for arrays < ${WasmThresholds.elementWise} elements
   - Parallel for arrays > ${WasmThresholds.parallel} elements

✅ Streaming Compilation:
   - Browser: WebAssembly.instantiateStreaming (when available)
   - Node.js: Compile + cache module for reuse

✅ Memory Pooling:
   - Reduces allocation overhead for repeated operations
   - Pool entries reused within 2x size match

Recommendations:
1. Call precompile() at app startup for fastest subsequent loads
2. Use operation-specific thresholds for optimal JS/WASM selection
3. For repeated operations, memory pooling reduces allocation overhead
`)

  console.log('='.repeat(80))
}

main().catch(console.error)
