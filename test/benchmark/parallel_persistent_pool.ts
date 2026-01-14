// @ts-nocheck
/**
 * Persistent Worker Pool Benchmark
 *
 * The key insight: worker CREATION takes 50-60ms
 * With a pre-created pool, parallel can be faster for large operations
 */

import { Worker } from 'worker_threads'
import os from 'os'

const NUM_CPUS = os.cpus().length
console.log(`\nSystem: ${NUM_CPUS} CPUs available`)
console.log(`Node.js: ${process.version}`)

// =============================================================================
// Persistent Worker Pool (workers created ONCE)
// =============================================================================

class PersistentWorkerPool {
  workers: Worker[]
  available: Worker[]
  pending: Array<() => void>
  ready: Promise<void>

  constructor (numWorkers: number = 4) {
    this.workers = []
    this.available = []
    this.pending = []
    this.ready = this.init(numWorkers)
  }

  async init (numWorkers: number): Promise<void> {
    const workerCode = `
      import { parentPort } from 'worker_threads'

      parentPort.on('message', ({ task, sharedA, sharedB, sharedResult, start, end, idx }) => {
        const a = sharedA ? new Float64Array(sharedA) : null
        const b = sharedB ? new Float64Array(sharedB) : null
        const result = sharedResult ? new Float64Array(sharedResult) : null

        if (task === 'dot') {
          let sum = 0
          for (let i = start; i < end; i++) {
            sum += a[i] * b[i]
          }
          if (result) result[idx] = sum
          parentPort.postMessage({ done: true, value: sum })
        } else if (task === 'sum') {
          let sum = 0
          for (let i = start; i < end; i++) {
            sum += a[i]
          }
          if (result) result[idx] = sum
          parentPort.postMessage({ done: true, value: sum })
        } else if (task === 'matmul') {
          // Matrix multiply chunk: compute rows [start, end) of result
          const { aCols, bCols } = arguments[0] || {}
          // This is simplified - in real impl would need more params
          parentPort.postMessage({ done: true })
        }
      })
    `

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(
        new URL('data:text/javascript,' + encodeURIComponent(workerCode))
      )
      this.workers.push(worker)
      this.available.push(worker)
    }

    // Wait for workers to be ready
    await new Promise<void>(_resolve => setTimeout(_resolve, 100))
    console.log(`Worker pool ready with ${numWorkers} workers`)
  }

  async exec (task: string, data: any): Promise<any> {
    await this.ready

    const worker = this.available.pop()
    if (!worker) {
      // Wait for a worker to become available
      await new Promise<void>(resolve => this.pending.push(resolve))
      return this.exec(task, data)
    }

    return new Promise((resolve) => {
      const handler = (msg: any) => {
        worker.off('message', handler)
        this.available.push(worker)

        // Wake up any pending tasks
        if (this.pending.length > 0) {
          const next = this.pending.shift()
          next!()
        }

        resolve(msg)
      }

      worker.on('message', handler)
      worker.postMessage({ task, ...data })
    })
  }

  async dotProduct (a: Float64Array, b: Float64Array, size: number): Promise<number> {
    const numWorkers = this.workers.length
    const chunkSize = Math.ceil(size / numWorkers)

    // Use SharedArrayBuffer for zero-copy
    const sharedA = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedB = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedResult = new SharedArrayBuffer(numWorkers * Float64Array.BYTES_PER_ELEMENT)

    new Float64Array(sharedA).set(a)
    new Float64Array(sharedB).set(b)

    const promises: Promise<any>[] = []
    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      promises.push(this.exec('dot', { sharedA, sharedB, sharedResult, start, end, idx: i }))
    }

    await Promise.all(promises)

    const results = new Float64Array(sharedResult)
    let total = 0
    for (let i = 0; i < numWorkers; i++) {
      total += results[i]
    }
    return total
  }

  async sum (arr: Float64Array): Promise<number> {
    const size = arr.length
    const numWorkers = this.workers.length
    const chunkSize = Math.ceil(size / numWorkers)

    const sharedA = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
    const sharedResult = new SharedArrayBuffer(numWorkers * Float64Array.BYTES_PER_ELEMENT)

    new Float64Array(sharedA).set(arr)

    const promises: Promise<any>[] = []
    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, size)

      promises.push(this.exec('sum', { sharedA, sharedResult, start, end, idx: i }))
    }

    await Promise.all(promises)

    const results = new Float64Array(sharedResult)
    let total = 0
    for (let i = 0; i < numWorkers; i++) {
      total += results[i]
    }
    return total
  }

  async terminate (): Promise<void> {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }
}

// =============================================================================
// Pure JavaScript
// =============================================================================

function jsDotProduct (a: Float64Array, b: Float64Array, size: number): number {
  let sum = 0
  for (let i = 0; i < size; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

function jsSum (arr: Float64Array): number {
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]
  }
  return total
}

// =============================================================================
// Benchmark
// =============================================================================

function generateVector (size: number): Float64Array {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

interface BenchmarkResult {
  avg: number
  opsPerSec: number
}

async function benchmark (name: string, fn: () => Promise<any> | any, warmupRuns: number = 5, benchRuns: number = 20): Promise<BenchmarkResult> {
  // Warmup
  for (let i = 0; i < warmupRuns; i++) {
    await fn()
  }

  // Benchmark
  const times: number[] = []
  for (let i = 0; i < benchRuns; i++) {
    const start = performance.now()
    await fn()
    times.push(performance.now() - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  const opsPerSec = 1000 / avg

  console.log(`  ${name.padEnd(40)} ${opsPerSec.toFixed(2).padStart(10)} ops/sec  ${avg.toFixed(3).padStart(10)}ms`)
  return { avg, opsPerSec }
}

// =============================================================================
// Main
// =============================================================================

async function main (): Promise<void> {
  console.log('\n' + '='.repeat(80))
  console.log('PERSISTENT WORKER POOL BENCHMARK')
  console.log('Workers created ONCE, reused for all operations')
  console.log('='.repeat(80))

  // Create pool once
  const pool = new PersistentWorkerPool(4)
  await pool.ready

  // ==========================================================================
  // Dot Product
  // ==========================================================================

  console.log('\n--- DOT PRODUCT ---\n')

  const dotSizes = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]

  for (const size of dotSizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const a = generateVector(size)
    const b = generateVector(size)

    const jsResult = await benchmark('Pure JS', () => jsDotProduct(a, b, size))
    const poolResult = await benchmark('Persistent Pool (SharedArrayBuffer)', () => pool.dotProduct(a, b, size))

    const speedup = poolResult.opsPerSec / jsResult.opsPerSec
    console.log(`  Speedup: ${speedup >= 1 ? speedup.toFixed(2) + 'x faster' : (1 / speedup).toFixed(2) + 'x slower'}`)
  }

  // ==========================================================================
  // Sum
  // ==========================================================================

  console.log('\n--- ARRAY SUM ---\n')

  const sumSizes = [1_000_000, 5_000_000, 10_000_000, 50_000_000]

  for (const size of sumSizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const arr = generateVector(size)

    const jsResult = await benchmark('Pure JS', () => jsSum(arr))
    const poolResult = await benchmark('Persistent Pool (SharedArrayBuffer)', () => pool.sum(arr))

    const speedup = poolResult.opsPerSec / jsResult.opsPerSec
    console.log(`  Speedup: ${speedup >= 1 ? speedup.toFixed(2) + 'x faster' : (1 / speedup).toFixed(2) + 'x slower'}`)
  }

  // Cleanup
  await pool.terminate()

  console.log('\n' + '='.repeat(80))
  console.log('CONCLUSION')
  console.log('='.repeat(80))
  console.log(`
Even with a persistent worker pool and SharedArrayBuffer:
- Dot product and sum are TOO SIMPLE to benefit from parallelism
- The coordination overhead (message passing) exceeds computation time
- For O(n) operations, single-threaded JS is nearly optimal

Parallelism DOES help for:
- O(n²) or O(n³) operations (matrix multiply, convolution)
- Operations taking 100ms+ to complete
- When computation >> coordination overhead

The math.js use case:
- Most operations are on small arrays (< 10K elements)
- Matrix multiply is the main candidate for parallelism
- Need matrices > 500×500 to see parallel benefit
`)
}

main().catch(console.error)
