/**
 * Matrix Worker for parallel computation using @danielsimonjr/workerpool
 * Handles matrix operations in separate threads
 */

import workerpool from '@danielsimonjr/workerpool'

/**
 * Matrix multiplication chunk: C[startRow:endRow] = A[startRow:endRow] * B
 * For use with SharedArrayBuffer - writes directly to resultData
 */
function matrixMultiplyChunk(params: {
  aData: Float64Array | number[]
  aRows: number
  aCols: number
  bData: Float64Array | number[]
  bRows: number
  bCols: number
  startRow: number
  endRow: number
  resultData: Float64Array
}): void {
  const { aData, aCols, bData, bCols, startRow, endRow, resultData } = params

  for (let i = startRow; i < endRow; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0
      for (let k = 0; k < aCols; k++) {
        sum += aData[i * aCols + k] * bData[k * bCols + j]
      }
      resultData[i * bCols + j] = sum
    }
  }
}

/**
 * Matrix multiplication returning result array (for non-shared memory)
 */
function matrixMultiply(
  a: number[],
  aRows: number,
  aCols: number,
  b: number[],
  bRows: number,
  bCols: number
): number[] {
  const result = new Array(aRows * bCols)
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

/**
 * Matrix addition chunk: C[start:end] = A[start:end] + B[start:end]
 * For use with SharedArrayBuffer
 */
function matrixAddChunk(params: {
  aData: Float64Array | number[]
  bData: Float64Array | number[]
  start: number
  end: number
  resultData: Float64Array
}): void {
  const { aData, bData, start, end, resultData } = params

  for (let i = start; i < end; i++) {
    resultData[i] = aData[i] + bData[i]
  }
}

/**
 * Matrix addition returning result array (for non-shared memory)
 */
function matrixAdd(a: number[], b: number[]): number[] {
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

/**
 * Matrix transpose chunk: B[j*rows+i] = A[i*cols+j] for i in [startRow:endRow]
 * For use with SharedArrayBuffer
 */
function matrixTransposeChunk(params: {
  data: Float64Array | number[]
  rows: number
  cols: number
  startRow: number
  endRow: number
  resultData: Float64Array
}): void {
  const { data, rows, cols, startRow, endRow, resultData } = params

  for (let i = startRow; i < endRow; i++) {
    for (let j = 0; j < cols; j++) {
      resultData[j * rows + i] = data[i * cols + j]
    }
  }
}

/**
 * Matrix transpose returning result array (for non-shared memory)
 */
function matrixTranspose(data: number[], rows: number, cols: number): number[] {
  const result = new Array(rows * cols)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = data[i * cols + j]
    }
  }
  return result
}

/**
 * Dot product of two vectors
 */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

/**
 * Dot product chunk for parallel processing
 */
function dotProductChunk(params: {
  aData: Float64Array | number[]
  bData: Float64Array | number[]
  start: number
  end: number
}): number {
  const { aData, bData, start, end } = params

  let sum = 0
  for (let i = start; i < end; i++) {
    sum += aData[i] * bData[i]
  }
  return sum
}

/**
 * Sum of array elements
 */
function sum(arr: number[]): number {
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]
  }
  return total
}

/**
 * Sum chunk for parallel processing
 */
function sumChunk(params: {
  data: Float64Array | number[]
  start: number
  end: number
}): number {
  const { data, start, end } = params

  let total = 0
  for (let i = start; i < end; i++) {
    total += data[i]
  }
  return total
}

/**
 * Mean of array elements
 */
function mean(arr: number[]): number {
  let total = 0
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]
  }
  return total / arr.length
}

/**
 * Process a chunk with a specified operation
 */
function processChunk(
  data: number[],
  operation: 'sum' | 'min' | 'max' | 'mean',
  start: number,
  end: number
): number {
  let result: number

  switch (operation) {
    case 'sum':
      result = 0
      for (let i = start; i < end; i++) result += data[i]
      break
    case 'min':
      result = data[start]
      for (let i = start + 1; i < end; i++) {
        if (data[i] < result) result = data[i]
      }
      break
    case 'max':
      result = data[start]
      for (let i = start + 1; i < end; i++) {
        if (data[i] > result) result = data[i]
      }
      break
    case 'mean':
      result = 0
      for (let i = start; i < end; i++) result += data[i]
      result = result / (end - start)
      break
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }

  return result
}

/**
 * Element-wise matrix scaling: B = A * scalar
 */
function matrixScale(data: number[], scalar: number): number[] {
  const result = new Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] * scalar
  }
  return result
}

/**
 * Element-wise matrix scaling chunk (for SharedArrayBuffer)
 */
function matrixScaleChunk(params: {
  data: Float64Array | number[]
  scalar: number
  start: number
  end: number
  resultData: Float64Array
}): void {
  const { data, scalar, start, end, resultData } = params

  for (let i = start; i < end; i++) {
    resultData[i] = data[i] * scalar
  }
}

/**
 * Element-wise subtraction: C = A - B
 */
function matrixSubtract(a: number[], b: number[]): number[] {
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] - b[i]
  }
  return result
}

/**
 * Element-wise subtraction chunk (for SharedArrayBuffer)
 */
function matrixSubtractChunk(params: {
  aData: Float64Array | number[]
  bData: Float64Array | number[]
  start: number
  end: number
  resultData: Float64Array
}): void {
  const { aData, bData, start, end, resultData } = params

  for (let i = start; i < end; i++) {
    resultData[i] = aData[i] - bData[i]
  }
}

/**
 * Element-wise multiplication (Hadamard product): C = A .* B
 */
function matrixElementMultiply(a: number[], b: number[]): number[] {
  const result = new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] * b[i]
  }
  return result
}

/**
 * Element-wise multiplication chunk (for SharedArrayBuffer)
 */
function matrixElementMultiplyChunk(params: {
  aData: Float64Array | number[]
  bData: Float64Array | number[]
  start: number
  end: number
  resultData: Float64Array
}): void {
  const { aData, bData, start, end, resultData } = params

  for (let i = start; i < end; i++) {
    resultData[i] = aData[i] * bData[i]
  }
}

// Worker methods type for workerpool
type WorkerMethods = Record<string, (...args: any[]) => any>

// Register all worker functions with workerpool
const workerMethods: WorkerMethods = {
  // Chunk operations (for SharedArrayBuffer parallel processing)
  matrixMultiplyChunk,
  matrixAddChunk,
  matrixTransposeChunk,
  dotProductChunk,
  sumChunk,
  matrixScaleChunk,
  matrixSubtractChunk,
  matrixElementMultiplyChunk,

  // Full operations (for non-shared memory)
  matrixMultiply,
  matrixAdd,
  matrixTranspose,
  dotProduct,
  sum,
  mean,
  processChunk,
  matrixScale,
  matrixSubtract,
  matrixElementMultiply
}

workerpool.worker(workerMethods)
