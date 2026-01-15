// @ts-nocheck
/**
 * WASM Loading Performance Profile
 *
 * Profiles:
 * 1. Initial WASM module loading time
 * 2. Memory allocation overhead
 * 3. Small vs large operation overhead
 * 4. JS vs WASM crossover points
 */

import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface TimingResult {
  name: string
  avg: number
  min: number
  max: number
  runs: number
}

async function timeAsync(name: string, fn: () => Promise<any>, runs: number = 10): Promise<TimingResult> {
  const times: number[] = []

  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    await fn()
    times.push(performance.now() - start)
  }

  return {
    name,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    runs
  }
}

function timeSync(name: string, fn: () => any, runs: number = 1000): TimingResult {
  const times: number[] = []

  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    fn()
    times.push(performance.now() - start)
  }

  return {
    name,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    runs
  }
}

function formatResult(result: TimingResult): string {
  return `${result.name.padEnd(45)} avg: ${result.avg.toFixed(3).padStart(8)}ms  min: ${result.min.toFixed(3).padStart(8)}ms  max: ${result.max.toFixed(3).padStart(8)}ms`
}

async function main(): Promise<void> {
  console.log('='.repeat(90))
  console.log('WASM LOADING PERFORMANCE PROFILE')
  console.log('='.repeat(90))

  const wasmPath = join(__dirname, '../../lib/wasm/index.wasm')

  // Check if WASM file exists
  if (!fs.existsSync(wasmPath)) {
    console.log('\nWASM file not found at:', wasmPath)
    console.log('Run `npm run build:wasm` first.')
    return
  }

  const wasmStats = fs.statSync(wasmPath)
  console.log(`\nWASM file size: ${(wasmStats.size / 1024).toFixed(1)} KB`)

  // ============================================================================
  // 1. WASM File Loading (I/O)
  // ============================================================================
  console.log('\n--- 1. WASM FILE LOADING (I/O) ---\n')

  // Time raw file read
  const fileReadResult = await timeAsync('fs.readFile (raw buffer)', async () => {
    await fs.promises.readFile(wasmPath)
  }, 20)
  console.log(formatResult(fileReadResult))

  // Time file read with sync
  const fileReadSyncResult = timeSync('fs.readFileSync', () => {
    fs.readFileSync(wasmPath)
  }, 20)
  console.log(formatResult(fileReadSyncResult))

  // ============================================================================
  // 2. WASM Compilation
  // ============================================================================
  console.log('\n--- 2. WASM COMPILATION ---\n')

  const wasmBuffer = fs.readFileSync(wasmPath)

  // Time WebAssembly.compile
  const compileResult = await timeAsync('WebAssembly.compile', async () => {
    await WebAssembly.compile(wasmBuffer)
  }, 10)
  console.log(formatResult(compileResult))

  // Time WebAssembly.compileStreaming (simulated with buffer)
  // Note: Node.js doesn't support compileStreaming directly

  // ============================================================================
  // 3. WASM Instantiation
  // ============================================================================
  console.log('\n--- 3. WASM INSTANTIATION ---\n')

  const imports = {
    env: {
      abort: () => { throw new Error('abort') },
      seed: () => Date.now()
    },
    Math: Math as any,
    Date: Date as any
  }

  // Compile once for instantiation tests
  const compiledModule = await WebAssembly.compile(wasmBuffer)

  // Time instantiation from compiled module
  const instantiateCompiledResult = await timeAsync('WebAssembly.instantiate (compiled)', async () => {
    await WebAssembly.instantiate(compiledModule, imports)
  }, 10)
  console.log(formatResult(instantiateCompiledResult))

  // Time full compile + instantiate
  const fullLoadResult = await timeAsync('compile + instantiate (full)', async () => {
    const module = await WebAssembly.compile(wasmBuffer)
    await WebAssembly.instantiate(module, imports)
  }, 10)
  console.log(formatResult(fullLoadResult))

  // Time WebAssembly.instantiate with buffer (single call)
  const instantiateBufferResult = await timeAsync('WebAssembly.instantiate (buffer)', async () => {
    await WebAssembly.instantiate(wasmBuffer, imports)
  }, 10)
  console.log(formatResult(instantiateBufferResult))

  // ============================================================================
  // 4. Memory Allocation Overhead
  // ============================================================================
  console.log('\n--- 4. MEMORY ALLOCATION OVERHEAD ---\n')

  const instance = await WebAssembly.instantiate(compiledModule, imports)
  const exports = instance.exports as any
  const memory = exports.memory as WebAssembly.Memory

  // Test Float64Array view creation
  const viewCreationResult = timeSync('Float64Array view creation (1000 elem)', () => {
    new Float64Array(memory.buffer, 0, 1000)
  }, 10000)
  console.log(formatResult(viewCreationResult))

  // Test data copying
  const testData = new Float64Array(1000)
  for (let i = 0; i < 1000; i++) testData[i] = Math.random()

  const dataCopyResult = timeSync('Float64Array.set (1000 elem)', () => {
    const view = new Float64Array(memory.buffer, 0, 1000)
    view.set(testData)
  }, 10000)
  console.log(formatResult(dataCopyResult))

  // Test various sizes
  const sizes = [10, 100, 1000, 10000, 100000]
  console.log('\n  Memory copy by size:')
  for (const size of sizes) {
    const data = new Float64Array(size)
    for (let i = 0; i < size; i++) data[i] = Math.random()

    const result = timeSync(`  copy ${size.toString().padStart(6)} elements`, () => {
      const view = new Float64Array(memory.buffer, 0, size)
      view.set(data)
    }, Math.min(1000, 100000 / size))
    console.log(formatResult(result))
  }

  // ============================================================================
  // 5. JS vs WASM Crossover Point (dot product)
  // ============================================================================
  console.log('\n--- 5. JS vs WASM CROSSOVER POINT (dot product) ---\n')

  // Pure JS dot product
  function jsDotProduct(a: Float64Array, b: Float64Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i]
    }
    return sum
  }

  // Check if WASM has dotProduct
  const wasmDotProduct = exports.dotProduct as ((aPtr: number, bPtr: number, size: number) => number) | undefined

  if (wasmDotProduct) {
    console.log('  Size         JS (ms)      WASM (ms)    Speedup    Winner')
    console.log('  ' + '-'.repeat(70))

    for (const size of [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000]) {
      const a = new Float64Array(size)
      const b = new Float64Array(size)
      for (let i = 0; i < size; i++) {
        a[i] = Math.random()
        b[i] = Math.random()
      }

      // JS timing
      const jsResult = timeSync('', () => jsDotProduct(a, b), Math.min(10000, 1000000 / size))

      // WASM timing (including memory copy overhead)
      const wasmResult = timeSync('', () => {
        const viewA = new Float64Array(memory.buffer, 0, size)
        const viewB = new Float64Array(memory.buffer, size * 8, size)
        viewA.set(a)
        viewB.set(b)
        return wasmDotProduct(0, size * 8, size)
      }, Math.min(10000, 1000000 / size))

      const speedup = jsResult.avg / wasmResult.avg
      const winner = speedup > 1 ? 'WASM' : 'JS'

      console.log(`  ${size.toString().padStart(6)}    ${jsResult.avg.toFixed(6).padStart(10)}   ${wasmResult.avg.toFixed(6).padStart(10)}   ${speedup.toFixed(2).padStart(7)}x   ${winner}`)
    }
  } else {
    console.log('  dotProduct not found in WASM exports')
  }

  // ============================================================================
  // 6. Summary
  // ============================================================================
  console.log('\n' + '='.repeat(90))
  console.log('SUMMARY')
  console.log('='.repeat(90))
  console.log(`
Key Findings:

1. WASM Loading Breakdown:
   - File read:     ${fileReadResult.avg.toFixed(2)}ms
   - Compilation:   ${compileResult.avg.toFixed(2)}ms
   - Instantiation: ${instantiateCompiledResult.avg.toFixed(2)}ms
   - Total:         ${fullLoadResult.avg.toFixed(2)}ms

2. Optimization Opportunities:
   - Cache compiled module (save ${compileResult.avg.toFixed(2)}ms on subsequent loads)
   - Pre-compile during build (move compilation to build time)
   - Use instantiate(buffer) instead of compile+instantiate (single call)
   - Pool memory allocations for repeated operations

3. Small Operation Overhead:
   - Memory copy is the main overhead for small arrays
   - For arrays < ~100 elements, JS may be faster due to copy overhead
   - Consider JS fallback for small operations

4. Recommendations:
   - Add size threshold to use JS for small operations
   - Implement memory pooling for frequent allocations
   - Cache compiled WASM module
   - Consider lazy loading of WASM for initial page load
`)

  console.log('='.repeat(90))
}

main().catch(console.error)
