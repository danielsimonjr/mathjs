/**
 * Example: Using TypeScript + WASM + Parallel Computing with mathjs
 *
 * This example demonstrates the new high-performance features:
 * - WASM-accelerated matrix operations
 * - Parallel/multicore computing
 * - Automatic optimization selection
 */

import { MatrixWasmBridge } from '../src/wasm/MatrixWasmBridge.js'
import { ParallelMatrix } from '../src/parallel/ParallelMatrix.js'

async function main() {
  console.log('=== TypeScript + WASM + Parallel Computing Example ===\n')

  // Initialize WASM module
  console.log('Initializing WASM...')
  await MatrixWasmBridge.init()

  // Check capabilities
  const caps = MatrixWasmBridge.getCapabilities()
  console.log('Capabilities:')
  console.log('  WASM Available:', caps.wasmAvailable)
  console.log('  Parallel Available:', caps.parallelAvailable)
  console.log('  SIMD Available:', caps.simdAvailable)
  console.log()

  // Example 1: Matrix Multiplication Benchmark
  console.log('=== Example 1: Matrix Multiplication Benchmark ===')
  await matrixMultiplicationBenchmark()
  console.log()

  // Example 2: LU Decomposition
  console.log('=== Example 2: LU Decomposition ===')
  await luDecompositionExample()
  console.log()

  // Example 3: Parallel Matrix Operations
  console.log('=== Example 3: Parallel Matrix Operations ===')
  await parallelMatrixExample()
  console.log()

  // Example 4: Configuration Options
  console.log('=== Example 4: Custom Configuration ===')
  await customConfigurationExample()
  console.log()

  // Cleanup
  console.log('Cleaning up...')
  await MatrixWasmBridge.cleanup()
  console.log('Done!')
}

/**
 * Example 1: Matrix Multiplication Performance Comparison
 */
async function matrixMultiplicationBenchmark() {
  const size = 500
  console.log(`Matrix size: ${size}x${size}\n`)

  // Generate random matrices
  const a = new Float64Array(size * size)
  const b = new Float64Array(size * size)
  for (let i = 0; i < size * size; i++) {
    a[i] = Math.random()
    b[i] = Math.random()
  }

  // Benchmark with WASM (automatic selection)
  console.log('Computing with automatic optimization...')
  const start = performance.now()
  const result = await MatrixWasmBridge.multiply(a, size, size, b, size, size)
  const end = performance.now()

  console.log(`Time: ${(end - start).toFixed(2)}ms`)
  console.log(`Result dimensions: ${size}x${size}`)
  console.log(`First 4 elements: [${result.slice(0, 4).join(', ')}]`)
}

/**
 * Example 2: LU Decomposition
 */
async function luDecompositionExample() {
  // Create a test matrix
  const n = 4
  const matrix = new Float64Array([
    4, 3, 2, 1,
    3, 4, 3, 2,
    2, 3, 4, 3,
    1, 2, 3, 4
  ])

  console.log('Input matrix (4x4):')
  printMatrix(matrix, n, n)
  console.log()

  // Perform LU decomposition
  const { lu, perm, singular } = await MatrixWasmBridge.luDecomposition(matrix, n)

  if (singular) {
    console.log('Matrix is singular!')
  } else {
    console.log('LU Decomposition successful')
    console.log('Permutation vector:', Array.from(perm))
    console.log('\nL and U (combined):')
    printMatrix(lu, n, n)
  }
}

/**
 * Example 3: Parallel Matrix Operations
 */
async function parallelMatrixExample() {
  // Configure parallel execution
  ParallelMatrix.configure({
    minSizeForParallel: 100,
    maxWorkers: 4,
    useSharedMemory: true
  })

  const size = 1000
  console.log(`Large matrix multiplication: ${size}x${size}`)
  console.log('Using parallel/multicore execution\n')

  // Generate large matrices
  const a = new Float64Array(size * size)
  const b = new Float64Array(size * size)
  for (let i = 0; i < size * size; i++) {
    a[i] = Math.random()
    b[i] = Math.random()
  }

  // Multiply using parallel workers
  console.log('Computing with parallel workers...')
  const start = performance.now()
  const result = await ParallelMatrix.multiply(a, size, size, b, size, size)
  const end = performance.now()

  console.log(`Time: ${(end - start).toFixed(2)}ms`)
  console.log(`Workers used: 4 (or auto-detected)`)
  console.log(`First 4 elements: [${result.slice(0, 4).join(', ')}]`)

  // Test matrix addition
  console.log('\nParallel matrix addition...')
  const addStart = performance.now()
  const sum = await ParallelMatrix.add(a, b, size * size)
  const addEnd = performance.now()
  console.log(`Time: ${(addEnd - addStart).toFixed(2)}ms`)

  // Test matrix transpose
  console.log('\nParallel matrix transpose...')
  const transposeStart = performance.now()
  const transposed = await ParallelMatrix.transpose(a, size, size)
  const transposeEnd = performance.now()
  console.log(`Time: ${(transposeEnd - transposeStart).toFixed(2)}ms`)
}

/**
 * Example 4: Custom Configuration
 */
async function customConfigurationExample() {
  // Configure to use only JavaScript (no WASM)
  console.log('Configuration 1: JavaScript only')
  MatrixWasmBridge.configure({
    useWasm: false,
    useParallel: false
  })

  const size = 100
  const a = new Float64Array(size * size).map(() => Math.random())
  const b = new Float64Array(size * size).map(() => Math.random())

  const start1 = performance.now()
  await MatrixWasmBridge.multiply(a, size, size, b, size, size)
  const end1 = performance.now()
  console.log(`Time (JavaScript): ${(end1 - start1).toFixed(2)}ms\n`)

  // Configure to use WASM only
  console.log('Configuration 2: WASM only')
  MatrixWasmBridge.configure({
    useWasm: true,
    useParallel: false,
    minSizeForWasm: 0  // Always use WASM
  })

  const start2 = performance.now()
  await MatrixWasmBridge.multiply(a, size, size, b, size, size)
  const end2 = performance.now()
  console.log(`Time (WASM): ${(end2 - start2).toFixed(2)}ms\n`)

  // Configure for optimal performance
  console.log('Configuration 3: Optimal (WASM + Parallel)')
  MatrixWasmBridge.configure({
    useWasm: true,
    useParallel: true,
    minSizeForWasm: 100,
    minSizeForParallel: 1000
  })

  const largeSize = 500
  const c = new Float64Array(largeSize * largeSize).map(() => Math.random())
  const d = new Float64Array(largeSize * largeSize).map(() => Math.random())

  const start3 = performance.now()
  await MatrixWasmBridge.multiply(c, largeSize, largeSize, d, largeSize, largeSize)
  const end3 = performance.now()
  console.log(`Time (Optimal, ${largeSize}x${largeSize}): ${(end3 - start3).toFixed(2)}ms`)
}

/**
 * Utility: Print matrix
 */
function printMatrix(data: Float64Array, rows: number, cols: number) {
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push(data[i * cols + j].toFixed(2))
    }
    console.log('  [' + row.join(', ') + ']')
  }
}

// Run the examples
main().catch(console.error)
