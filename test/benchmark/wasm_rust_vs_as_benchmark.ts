/**
 * Benchmark: Rust WASM vs AssemblyScript WASM vs pure JavaScript
 *
 * Run with: npx tsx test/benchmark/wasm_rust_vs_as_benchmark.ts
 * Prerequisites: npm run build:wasm:all
 */

import { performance } from 'perf_hooks'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================
// Utilities
// ============================================================

interface WasmExports {
  memory: WebAssembly.Memory
  multiplyDense?: Function
  add?: Function
  dotProduct?: Function
  transpose?: Function
  det?: Function
  [key: string]: any
}

function bench(fn: () => void, warmup = 3, iterations = 10): number {
  for (let i = 0; i < warmup; i++) fn()
  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  return times[Math.floor(times.length / 2)]
}

function speedup(base: number, fast: number): string {
  if (fast <= 0 || base <= 0) return 'N/A'
  const ratio = base / fast
  return ratio >= 1 ? `${ratio.toFixed(1)}x faster` : `${(1/ratio).toFixed(1)}x slower`
}

// ============================================================
// Load WASM module
// ============================================================

async function loadWasm(wasmPath: string): Promise<WasmExports | null> {
  if (!fs.existsSync(wasmPath)) return null
  try {
    const buffer = fs.readFileSync(wasmPath)
    const module = await WebAssembly.compile(buffer)
    const instance = await WebAssembly.instantiate(module, {
      env: {
        abort: () => {},
        'Math.cos': Math.cos,
        'Math.sin': Math.sin,
        'Math.sqrt': Math.sqrt,
        'Math.abs': Math.abs,
        'Math.log': Math.log,
        'Math.exp': Math.exp,
        'Math.pow': Math.pow,
        'Math.floor': Math.floor,
        'Math.ceil': Math.ceil,
        'Math.round': Math.round,
        'Math.random': Math.random,
        'Math.atan2': Math.atan2,
        'Math.min': Math.min,
        'Math.max': Math.max,
        seed: () => {},
      }
    })
    return instance.exports as any as WasmExports
  } catch (e: any) {
    console.log(`  [Could not load ${path.basename(wasmPath)}: ${e.message?.slice(0, 80)}]`)
    return null
  }
}

// ============================================================
// WASM memory helpers
// ============================================================

function writeF64(memory: WebAssembly.Memory, offset: number, data: Float64Array): void {
  new Float64Array(memory.buffer, offset, data.length).set(data)
}

function readF64(memory: WebAssembly.Memory, offset: number, length: number): Float64Array {
  return new Float64Array(memory.buffer, offset, length).slice()
}

function flattenMatrix(m: number[][]): Float64Array {
  const rows = m.length, cols = m[0].length
  const flat = new Float64Array(rows * cols)
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      flat[i * cols + j] = m[i][j]
  return flat
}

// ============================================================
// JS reference implementations
// ============================================================

function jsMatMul(a: number[][], b: number[][]): number[][] {
  const m = a.length, n = b[0].length, k = b.length
  const c: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) {
      let s = 0
      for (let p = 0; p < k; p++) s += a[i][p] * b[p][j]
      c[i][j] = s
    }
  return c
}

function jsDot(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function jsVecAdd(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(a.length)
  for (let i = 0; i < a.length; i++) r[i] = a[i] + b[i]
  return r
}

function jsDet(m: number[][], n: number): number {
  // LU-based determinant
  const a = m.map(r => [...r])
  let sign = 1
  for (let k = 0; k < n; k++) {
    let maxVal = 0, maxRow = k
    for (let i = k; i < n; i++) {
      const v = Math.abs(a[i][k])
      if (v > maxVal) { maxVal = v; maxRow = i }
    }
    if (maxRow !== k) { [a[k], a[maxRow]] = [a[maxRow], a[k]]; sign = -sign }
    if (Math.abs(a[k][k]) < 1e-14) return 0
    for (let i = k + 1; i < n; i++) {
      const f = a[i][k] / a[k][k]
      for (let j = k + 1; j < n; j++) a[i][j] -= f * a[k][j]
    }
  }
  let det = sign
  for (let i = 0; i < n; i++) det *= a[i][i]
  return det
}

// ============================================================
// Test data generators
// ============================================================

function randomMatrix(n: number): number[][] {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random() * 10 - 5))
}

function randomF64(n: number): Float64Array {
  const a = new Float64Array(n)
  for (let i = 0; i < n; i++) a[i] = Math.random() * 10 - 5
  return a
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('='.repeat(80))
  console.log(' Benchmark: Rust WASM  vs  AssemblyScript WASM  vs  JavaScript')
  console.log('='.repeat(80))
  console.log()

  const rustPath = path.join(__dirname, '..', '..', 'lib', 'wasm', 'mathjs.wasm')
  const asPath = path.join(__dirname, '..', '..', 'lib', 'wasm', 'mathjs-as.wasm')

  const hasRust = fs.existsSync(rustPath)
  const hasAS = fs.existsSync(asPath)

  console.log(`Rust WASM: ${hasRust ? (fs.statSync(rustPath).size / 1024).toFixed(0) + ' KB' : 'NOT FOUND'}`)
  console.log(`AS WASM:   ${hasAS ? (fs.statSync(asPath).size / 1024).toFixed(0) + ' KB' : 'NOT FOUND'}`)
  console.log()

  // Load WASM modules
  console.log('Loading WASM modules...')
  const rust = hasRust ? await loadWasm(rustPath) : null
  const as_ = hasAS ? await loadWasm(asPath) : null
  console.log(`  Rust: ${rust ? 'loaded (' + Object.keys(rust).filter(k => typeof rust[k] === 'function').length + ' exports)' : 'not available'}`)
  console.log(`  AS:   ${as_ ? 'loaded (' + Object.keys(as_).filter(k => typeof as_[k] === 'function').length + ' exports)' : 'not available'}`)
  console.log()

  // Results collector
  const rows: string[][] = []
  rows.push(['Operation', 'JS (ms)', 'Rust (ms)', 'AS (ms)', 'Rust vs JS', 'Rust vs AS'])

  // Helper to run a WASM benchmark
  function wasmBench(
    wasm: WasmExports | null,
    fnName: string,
    setup: (mem: WebAssembly.Memory) => any[],
    cleanup?: () => void
  ): number | null {
    if (!wasm || !wasm[fnName]) return null
    const args = setup(wasm.memory)
    return bench(() => { wasm[fnName]!(...args) })
  }

  // ============================================================
  // Matrix Multiply
  // ============================================================
  for (const n of [50, 100, 200]) {
    const label = `matmul ${n}x${n}`
    console.log(`--- ${label} ---`)

    const a = randomMatrix(n)
    const b = randomMatrix(n)
    const flatA = flattenMatrix(a)
    const flatB = flattenMatrix(b)

    const jsMs = bench(() => jsMatMul(a, b))

    // Allocate WASM memory for each backend
    let rustMs: number | null = null
    if (rust?.multiplyDense && rust.memory) {
      const baseOffset = 1024 // safe offset past stack
      const aOff = baseOffset
      const bOff = aOff + n * n * 8
      const cOff = bOff + n * n * 8
      // Ensure enough memory
      const needed = cOff + n * n * 8
      const pages = Math.ceil(needed / 65536)
      while (rust.memory.buffer.byteLength < needed) {
        rust.memory.grow(pages)
      }
      writeF64(rust.memory, aOff, flatA)
      writeF64(rust.memory, bOff, flatB)
      rustMs = bench(() => {
        (rust.multiplyDense as Function)(aOff, n, n, bOff, n, n, cOff)
      })
    }

    let asMs: number | null = null
    // AS uses __new for allocation — skip direct memory write for now

    console.log(`  JS:   ${jsMs.toFixed(3)} ms`)
    if (rustMs !== null) console.log(`  Rust: ${rustMs.toFixed(3)} ms  (${speedup(jsMs, rustMs)})`)
    if (asMs !== null) console.log(`  AS:   ${asMs.toFixed(3)} ms`)

    rows.push([label, jsMs.toFixed(3), rustMs?.toFixed(3) ?? '-', asMs?.toFixed(3) ?? '-',
      rustMs ? speedup(jsMs, rustMs) : '-', (rustMs && asMs) ? speedup(asMs, rustMs) : '-'])
  }

  // ============================================================
  // Dot Product
  // ============================================================
  for (const n of [1000, 10000, 100000]) {
    const label = `dot ${n}`
    console.log(`--- ${label} ---`)

    const va = randomF64(n)
    const vb = randomF64(n)

    const jsMs = bench(() => jsDot(va, vb))

    let rustMs: number | null = null
    if (rust?.dotProduct && rust.memory) {
      const aOff = 1024
      const bOff = aOff + n * 8
      const needed = bOff + n * 8
      while (rust.memory.buffer.byteLength < needed) {
        rust.memory.grow(Math.ceil(needed / 65536))
      }
      writeF64(rust.memory, aOff, va)
      writeF64(rust.memory, bOff, vb)
      rustMs = bench(() => {
        (rust.dotProduct as Function)(aOff, bOff, n)
      })
    }

    console.log(`  JS:   ${jsMs.toFixed(3)} ms`)
    if (rustMs !== null) console.log(`  Rust: ${rustMs.toFixed(3)} ms  (${speedup(jsMs, rustMs)})`)

    rows.push([label, jsMs.toFixed(3), rustMs?.toFixed(3) ?? '-', '-',
      rustMs ? speedup(jsMs, rustMs) : '-', '-'])
  }

  // ============================================================
  // Vector Add
  // ============================================================
  for (const n of [1000, 10000, 100000]) {
    const label = `vecadd ${n}`
    console.log(`--- ${label} ---`)

    const va = randomF64(n)
    const vb = randomF64(n)

    const jsMs = bench(() => jsVecAdd(va, vb))

    let rustMs: number | null = null
    if (rust?.add && rust.memory) {
      const aOff = 1024
      const bOff = aOff + n * 8
      const cOff = bOff + n * 8
      const needed = cOff + n * 8
      while (rust.memory.buffer.byteLength < needed) {
        rust.memory.grow(Math.ceil(needed / 65536))
      }
      writeF64(rust.memory, aOff, va)
      writeF64(rust.memory, bOff, vb)
      rustMs = bench(() => {
        (rust.add as Function)(aOff, bOff, n, cOff)
      })
    }

    console.log(`  JS:   ${jsMs.toFixed(3)} ms`)
    if (rustMs !== null) console.log(`  Rust: ${rustMs.toFixed(3)} ms  (${speedup(jsMs, rustMs)})`)

    rows.push([label, jsMs.toFixed(3), rustMs?.toFixed(3) ?? '-', '-',
      rustMs ? speedup(jsMs, rustMs) : '-', '-'])
  }

  // ============================================================
  // Determinant
  // ============================================================
  for (const n of [10, 50, 100]) {
    const label = `det ${n}x${n}`
    console.log(`--- ${label} ---`)

    const m = randomMatrix(n)
    const flat = flattenMatrix(m)

    const jsMs = bench(() => jsDet(m, n))

    let rustMs: number | null = null
    if (rust?.det && rust.memory) {
      const aOff = 1024
      const needed = aOff + n * n * 8
      while (rust.memory.buffer.byteLength < needed) {
        rust.memory.grow(Math.ceil(needed / 65536))
      }
      writeF64(rust.memory, aOff, flat)
      rustMs = bench(() => {
        (rust.det as Function)(aOff, n)
      })
    }

    console.log(`  JS:   ${jsMs.toFixed(3)} ms`)
    if (rustMs !== null) console.log(`  Rust: ${rustMs.toFixed(3)} ms  (${speedup(jsMs, rustMs)})`)

    rows.push([label, jsMs.toFixed(3), rustMs?.toFixed(3) ?? '-', '-',
      rustMs ? speedup(jsMs, rustMs) : '-', '-'])
  }

  // ============================================================
  // Summary Table
  // ============================================================
  console.log()
  console.log('='.repeat(80))
  console.log(' Results')
  console.log('='.repeat(80))
  console.log()

  // Format as aligned table
  const colWidths = rows[0].map((_, ci) => Math.max(...rows.map(r => (r[ci] || '').length)))
  for (const [ri, row] of rows.entries()) {
    const line = row.map((cell, ci) => cell.padStart(colWidths[ci])).join('  ')
    console.log(line)
    if (ri === 0) console.log('-'.repeat(line.length))
  }

  console.log()
  console.log(`Binary sizes: Rust ${hasRust ? (fs.statSync(rustPath).size/1024).toFixed(0) : '?'} KB  |  AS ${hasAS ? (fs.statSync(asPath).size/1024).toFixed(0) : '?'} KB`)
}

main().catch(console.error)
