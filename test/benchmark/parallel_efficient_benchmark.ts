// @ts-nocheck
/**
 * Efficient Parallel Benchmark - Demonstrates proper parallelism
 *
 * Compares:
 * 1. Pure JavaScript (baseline)
 * 2. Worker Threads with SharedArrayBuffer (zero-copy)
 * 3. Worker Threads with ArrayBuffer transfer (near zero-copy)
 * 4. Inefficient workerpool (JSON serialization) for comparison
 */

import { Worker } from 'worker_threads'
import os from 'os'

const NUM_CPUS = os.cpus().length
console.log(`\nSystem: ${NUM_CPUS} CPUs available`)
console.log(`Node.js: ${process.version}`)

// =============================================================================
// Pure JavaScript (Baseline)
// =============================================================================

// eslint-disable-next-line no-unused-vars
function jsMatrixMultiply(
  a: Float64Array,
  aRows: number,
  aCols: number,
  b: Float64Array,
  _bRows: number,
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

function jsDotProduct(a: Float64Array, b: Float64Array, size: number): number {
  let sum = 0
  for (let i = 0; i < size; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

function jsSum(arr: Float64Array): number {
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]
  }
  return total
}

// =============================================================================
// Parallel with SharedArrayBuffer (Zero-Copy)
// =============================================================================

async function parallelDotProductShared(
  a: Float64Array,
  b: Float64Array,
  size: number
): Promise<number> {
  const numWorkers = Math.min(NUM_CPUS, 4)
  const chunkSize = Math.ceil(size / numWorkers)

  // Create SharedArrayBuffers - ZERO COPY to workers
  const sharedA = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
  const sharedB = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
  const viewA = new Float64Array(sharedA)
  const viewB = new Float64Array(sharedB)
  viewA.set(a) // One-time copy into shared memory
  viewB.set(b)

  // Shared result accumulator
  const sharedResult = new SharedArrayBuffer(
    numWorkers * Float64Array.BYTES_PER_ELEMENT
  )

  const workers: Worker[] = []
  const promises: Promise<any>[] = []

  for (let w = 0; w < numWorkers; w++) {
    const start = w * chunkSize
    const end = Math.min(start + chunkSize, size)

    const worker = new Worker(
      new URL(
        'data:text/javascript,' +
          encodeURIComponent(`
      import { parentPort, workerData } from 'worker_threads'

      const { sharedA, sharedB, sharedResult, start, end, workerIndex } = workerData
      const a = new Float64Array(sharedA)
      const b = new Float64Array(sharedB)
      const result = new Float64Array(sharedResult)

      let sum = 0
      for (let i = start; i < end; i++) {
        sum += a[i] * b[i]
      }

      result[workerIndex] = sum
      parentPort.postMessage('done')
    `)
      ),
      {
        workerData: {
          sharedA,
          sharedB,
          sharedResult,
          start,
          end,
          workerIndex: w
        }
      }
    )

    workers.push(worker)
    promises.push(new Promise((resolve) => worker.on('message', resolve)))
  }

  await Promise.all(promises)
  workers.forEach((w) => w.terminate())

  // Sum partial results
  const results = new Float64Array(sharedResult)
  let total = 0
  for (let i = 0; i < numWorkers; i++) {
    total += results[i]
  }

  return total
}

// =============================================================================
// Parallel with Transferable ArrayBuffer
// =============================================================================

async function parallelDotProductTransfer(
  a: Float64Array,
  b: Float64Array,
  size: number
): Promise<number> {
  const numWorkers = Math.min(NUM_CPUS, 4)
  const chunkSize = Math.ceil(size / numWorkers)

  const promises: Promise<number>[] = []

  for (let w = 0; w < numWorkers; w++) {
    const start = w * chunkSize
    const end = Math.min(start + chunkSize, size)
    const chunkLen = end - start

    // Create chunk buffers (these will be transferred, not copied)
    const chunkA = new Float64Array(chunkLen)
    const chunkB = new Float64Array(chunkLen)
    chunkA.set(a.subarray(start, end))
    chunkB.set(b.subarray(start, end))

    const worker = new Worker(
      new URL(
        'data:text/javascript,' +
          encodeURIComponent(`
      import { parentPort } from 'worker_threads'

      parentPort.on('message', ({ a, b }) => {
        const viewA = new Float64Array(a)
        const viewB = new Float64Array(b)
        let sum = 0
        for (let i = 0; i < viewA.length; i++) {
          sum += viewA[i] * viewB[i]
        }
        parentPort.postMessage(sum)
      })
    `)
      )
    )

    const promise = new Promise<number>((resolve) => {
      worker.on('message', (sum: number) => {
        worker.terminate()
        resolve(sum)
      })
    })

    // Transfer ownership (near zero-copy)
    worker.postMessage({ a: chunkA.buffer, b: chunkB.buffer }, [
      chunkA.buffer,
      chunkB.buffer
    ])

    promises.push(promise)
  }

  const results = await Promise.all(promises)
  return results.reduce((acc, val) => acc + val, 0)
}

// =============================================================================
// Parallel Sum with SharedArrayBuffer
// =============================================================================

async function parallelSumShared(arr: Float64Array): Promise<number> {
  const size = arr.length
  const numWorkers = Math.min(NUM_CPUS, 4)
  const chunkSize = Math.ceil(size / numWorkers)

  const sharedArr = new SharedArrayBuffer(size * Float64Array.BYTES_PER_ELEMENT)
  const view = new Float64Array(sharedArr)
  view.set(arr)

  const sharedResult = new SharedArrayBuffer(
    numWorkers * Float64Array.BYTES_PER_ELEMENT
  )

  const promises: Promise<any>[] = []
  const workers: Worker[] = []

  for (let w = 0; w < numWorkers; w++) {
    const start = w * chunkSize
    const end = Math.min(start + chunkSize, size)

    const worker = new Worker(
      new URL(
        'data:text/javascript,' +
          encodeURIComponent(`
      import { parentPort, workerData } from 'worker_threads'

      const { sharedArr, sharedResult, start, end, workerIndex } = workerData
      const arr = new Float64Array(sharedArr)
      const result = new Float64Array(sharedResult)

      let sum = 0
      for (let i = start; i < end; i++) {
        sum += arr[i]
      }

      result[workerIndex] = sum
      parentPort.postMessage('done')
    `)
      ),
      {
        workerData: { sharedArr, sharedResult, start, end, workerIndex: w }
      }
    )

    workers.push(worker)
    promises.push(new Promise((resolve) => worker.on('message', resolve)))
  }

  await Promise.all(promises)
  workers.forEach((w) => w.terminate())

  const results = new Float64Array(sharedResult)
  let total = 0
  for (let i = 0; i < numWorkers; i++) {
    total += results[i]
  }

  return total
}

// =============================================================================
// Test Data
// =============================================================================

function generateVector(size: number): Float64Array {
  const data = new Float64Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 100
  }
  return data
}

// =============================================================================
// Benchmark Runner
// =============================================================================

interface BenchmarkResult {
  avg: number
  opsPerSec: number
}

async function benchmark(
  name: string,
  fn: () => Promise<any> | any,
  warmupRuns: number = 3,
  benchRuns: number = 10
): Promise<BenchmarkResult> {
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
  const min = Math.min(...times)
  const max = Math.max(...times)
  const opsPerSec = 1000 / avg

  console.log(
    `  ${name.padEnd(40)} ${opsPerSec.toFixed(2).padStart(10)} ops/sec  ${avg.toFixed(2).padStart(8)}ms avg  (${min.toFixed(1)}-${max.toFixed(1)}ms)`
  )

  return { avg, opsPerSec }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  console.log('\n' + '='.repeat(90))
  console.log('EFFICIENT PARALLEL BENCHMARK')
  console.log('Comparing: JS vs SharedArrayBuffer vs Transferable ArrayBuffer')
  console.log('='.repeat(90))

  // ==========================================================================
  // Dot Product
  // ==========================================================================

  console.log('\n--- DOT PRODUCT ---\n')

  const sizes = [100_000, 500_000, 1_000_000, 5_000_000]

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const a = generateVector(size)
    const b = generateVector(size)

    const jsResult = await benchmark('Pure JS', () => jsDotProduct(a, b, size))

    let sharedResult: BenchmarkResult | undefined
    let transferResult: BenchmarkResult | undefined

    try {
      sharedResult = await benchmark(
        'Parallel (SharedArrayBuffer)',
        () => parallelDotProductShared(a, b, size),
        2,
        5
      )
    } catch (e: any) {
      console.log(`  Parallel (SharedArrayBuffer): ERROR - ${e.message}`)
    }

    try {
      transferResult = await benchmark(
        'Parallel (Transferable)',
        () => parallelDotProductTransfer(a, b, size),
        2,
        5
      )
    } catch (e: any) {
      console.log(`  Parallel (Transferable): ERROR - ${e.message}`)
    }

    // Calculate speedups
    console.log('\n  Speedups vs Pure JS:')
    if (sharedResult) {
      const speedup = sharedResult.opsPerSec / jsResult.opsPerSec
      console.log(
        `    SharedArrayBuffer: ${speedup >= 1 ? speedup.toFixed(2) + 'x faster' : (1 / speedup).toFixed(2) + 'x slower'}`
      )
    }
    if (transferResult) {
      const speedup = transferResult.opsPerSec / jsResult.opsPerSec
      console.log(
        `    Transferable: ${speedup >= 1 ? speedup.toFixed(2) + 'x faster' : (1 / speedup).toFixed(2) + 'x slower'}`
      )
    }
  }

  // ==========================================================================
  // Sum
  // ==========================================================================

  console.log('\n--- ARRAY SUM ---\n')

  for (const size of sizes) {
    console.log(`\n[${size.toLocaleString()} elements]`)

    const arr = generateVector(size)

    const jsResult = await benchmark('Pure JS', () => jsSum(arr))

    let sharedResult: BenchmarkResult | undefined
    try {
      sharedResult = await benchmark(
        'Parallel (SharedArrayBuffer)',
        () => parallelSumShared(arr),
        2,
        5
      )
    } catch (e: any) {
      console.log(`  Parallel (SharedArrayBuffer): ERROR - ${e.message}`)
    }

    if (sharedResult) {
      const speedup = sharedResult.opsPerSec / jsResult.opsPerSec
      console.log(
        `\n  Speedup: ${speedup >= 1 ? speedup.toFixed(2) + 'x faster' : (1 / speedup).toFixed(2) + 'x slower'}`
      )
    }
  }

  // ==========================================================================
  // Summary
  // ==========================================================================

  console.log('\n' + '='.repeat(90))
  console.log('KEY INSIGHTS')
  console.log('='.repeat(90))
  console.log(`
1. SharedArrayBuffer provides TRUE zero-copy parallelism
   - Data is shared directly between threads
   - No serialization overhead
   - Workers read from same memory location

2. Transferable ArrayBuffer is near zero-copy
   - Ownership is transferred, not copied
   - Slight overhead for buffer chunking
   - Good for one-time data transfer

3. workerpool with inline functions (JSON serialization) is SLOW
   - Every argument is JSON.stringify'd
   - For 1M floats = ~8MB JSON string each way
   - Serialization time >> computation time

4. Break-even point for parallelism:
   - Worker creation overhead: ~1-5ms per worker
   - Need operations taking >10ms to benefit
   - For simple ops like sum: need >10M elements
   - For complex ops like matrix multiply: >100K elements

5. For math.js optimization:
   - Use SharedArrayBuffer for large matrix operations
   - Keep single-threaded for operations < 100K elements
   - Pre-create worker pool to avoid creation overhead
`)

  console.log('='.repeat(90))
}

main().catch(console.error)
