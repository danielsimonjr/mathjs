/**
 * Benchmark: Rust WASM vs AssemblyScript WASM vs pure JavaScript
 *
 * Run with: npx tsx test/benchmark/wasm_rust_vs_as_benchmark.ts
 *
 * Prerequisites:
 *   npm run build:wasm:all   (builds both Rust and AS WASM binaries)
 *
 * Compares three backends for key math operations:
 *   1. Pure JavaScript (no WASM)
 *   2. AssemblyScript WASM (legacy, lib/wasm/mathjs-as.wasm)
 *   3. Rust WASM (new, lib/wasm/mathjs.wasm)
 */

import { performance } from 'perf_hooks'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================
// Benchmark utilities
// ============================================================

interface BenchmarkResult {
  name: string
  jsMs: number
  asMs: number | null
  rustMs: number | null
  rustVsJs: string
  rustVsAs: string
}

function formatSpeedup(base: number, fast: number): string {
  if (fast <= 0 || base <= 0) return 'N/A'
  const ratio = base / fast
  if (ratio >= 1) return `${ratio.toFixed(1)}x faster`
  return `${(1 / ratio).toFixed(1)}x slower`
}

function bench(fn: () => void, warmup = 3, iterations = 10): number {
  // Warmup
  for (let i = 0; i < warmup; i++) fn()

  // Measure
  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    times.push(performance.now() - start)
  }

  // Return median
  times.sort((a, b) => a - b)
  return times[Math.floor(times.length / 2)]
}

// ============================================================
// JS implementations of key operations (no WASM)
// ============================================================

function jsMatrixMultiply(a: number[][], b: number[][]): number[][] {
  const m = a.length, n = b[0].length, k = b.length
  const c: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let p = 0; p < k; p++) sum += a[i][p] * b[p][j]
      c[i][j] = sum
    }
  }
  return c
}

function jsDotProduct(a: Float64Array, b: Float64Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

function jsVectorAdd(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) r[i] = a[i] + b[i]
  return r
}

function jsTranspose(a: number[][], rows: number, cols: number): number[][] {
  const t: number[][] = Array.from({ length: cols }, () => new Array(rows))
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      t[j][i] = a[i][j]
  return t
}

function jsErf(x: number): number {
  // Abramowitz & Stegun approximation
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}

function jsErfArray(arr: Float64Array): Float64Array {
  const r = new Float64Array(arr.length)
  for (let i = 0; i < arr.length; i++) r[i] = jsErf(arr[i])
  return r
}

// ============================================================
// Generate test data
// ============================================================

function randomMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * 10 - 5)
  )
}

function randomF64Array(n: number): Float64Array {
  const a = new Float64Array(n)
  for (let i = 0; i < n; i++) a[i] = Math.random() * 10 - 5
  return a
}

// ============================================================
// Main benchmark
// ============================================================

async function main() {
  console.log('='.repeat(80))
  console.log('WASM Backend Benchmark: Rust vs AssemblyScript vs JavaScript')
  console.log('='.repeat(80))
  console.log()

  // Check for WASM binaries
  const rustPath = path.join(__dirname, '..', '..', 'lib', 'wasm', 'mathjs.wasm')
  const asPath = path.join(__dirname, '..', '..', 'lib', 'wasm', 'mathjs-as.wasm')

  const hasRust = fs.existsSync(rustPath)
  const hasAS = fs.existsSync(asPath)

  console.log(`Rust WASM: ${hasRust ? rustPath + ' (' + (fs.statSync(rustPath).size / 1024).toFixed(0) + ' KB)' : 'NOT FOUND'}`)
  console.log(`AS WASM:   ${hasAS ? asPath + ' (' + (fs.statSync(asPath).size / 1024).toFixed(0) + ' KB)' : 'NOT FOUND'}`)
  console.log()

  if (!hasRust && !hasAS) {
    console.error('No WASM binaries found. Run: npm run build:wasm:all')
    process.exit(1)
  }

  // Test data
  const sizes = [50, 100, 200]
  const results: BenchmarkResult[] = []

  for (const n of sizes) {
    console.log(`--- Matrix ${n}x${n} ---`)

    const a = randomMatrix(n, n)
    const b = randomMatrix(n, n)

    // JS benchmark
    const jsTime = bench(() => jsMatrixMultiply(a, b))
    console.log(`  JS matrix multiply:   ${jsTime.toFixed(2)} ms`)

    results.push({
      name: `matmul ${n}x${n}`,
      jsMs: jsTime,
      asMs: null,  // TODO: load AS module and benchmark
      rustMs: null, // TODO: load Rust module and benchmark
      rustVsJs: 'pending',
      rustVsAs: 'pending'
    })
  }

  // Vector operations
  for (const n of [1000, 10000, 100000]) {
    console.log(`--- Vector size ${n} ---`)

    const va = randomF64Array(n)
    const vb = randomF64Array(n)

    const dotTime = bench(() => jsDotProduct(va, vb))
    const addTime = bench(() => jsVectorAdd(va, vb))

    console.log(`  JS dot product:  ${dotTime.toFixed(3)} ms`)
    console.log(`  JS vector add:   ${addTime.toFixed(3)} ms`)

    results.push({
      name: `dot ${n}`,
      jsMs: dotTime,
      asMs: null,
      rustMs: null,
      rustVsJs: 'pending',
      rustVsAs: 'pending'
    })
  }

  // Special functions (array)
  for (const n of [100, 1000, 10000]) {
    const arr = randomF64Array(n)

    const erfTime = bench(() => jsErfArray(arr))
    console.log(`  JS erf(${n} elements): ${erfTime.toFixed(3)} ms`)

    results.push({
      name: `erf[${n}]`,
      jsMs: erfTime,
      asMs: null,
      rustMs: null,
      rustVsJs: 'pending',
      rustVsAs: 'pending'
    })
  }

  // Summary table
  console.log()
  console.log('='.repeat(80))
  console.log('Summary (JS baseline only — WASM backends require runtime loading)')
  console.log('='.repeat(80))
  console.log()
  console.log(`${'Operation'.padEnd(25)} ${'JS (ms)'.padStart(12)}`)
  console.log('-'.repeat(40))
  for (const r of results) {
    console.log(`${r.name.padEnd(25)} ${r.jsMs.toFixed(3).padStart(12)}`)
  }

  console.log()
  console.log('Note: Full Rust vs AS vs JS comparison requires WASM runtime loading.')
  console.log('The JS baselines above establish the performance floor that WASM must beat.')
  console.log()
  console.log('Binary sizes:')
  if (hasRust) console.log(`  Rust WASM: ${(fs.statSync(rustPath).size / 1024).toFixed(0)} KB`)
  if (hasAS) console.log(`  AS WASM:   ${(fs.statSync(asPath).size / 1024).toFixed(0)} KB`)
  if (hasRust && hasAS) {
    const ratio = fs.statSync(rustPath).size / fs.statSync(asPath).size
    console.log(`  Ratio:     Rust is ${ratio.toFixed(1)}x the size of AS`)
  }
}

main().catch(console.error)
