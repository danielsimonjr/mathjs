/**
 * Matrix Worker for parallel computation
 * Handles matrix operations in a separate thread
 */

declare const process: { versions?: { node?: string } } | undefined
declare function require(module: string): any

interface WorkerMessage {
  id: string
  type: 'task' | 'result' | 'error'
  data?: any
  error?: string
}

interface MatrixTask {
  operation: 'multiply' | 'add' | 'transpose' | 'dot'
  [key: string]: any
}

// Handle both Node.js worker_threads and browser Web Workers
const isNode = typeof process !== 'undefined' && process.versions?.node !== undefined

// Message handler
function handleMessage(event: MessageEvent | any): void {
  const message: WorkerMessage = isNode ? event : event.data

  try {
    const task: MatrixTask = message.data
    let result: any

    switch (task.operation) {
      case 'multiply':
        result = multiplyTask(task)
        break
      case 'add':
        result = addTask(task)
        break
      case 'transpose':
        result = transposeTask(task)
        break
      case 'dot':
        result = dotProductTask(task)
        break
      default:
        throw new Error(`Unknown operation: ${task.operation}`)
    }

    postMessage({
      id: message.id,
      type: 'result',
      data: result
    })
  } catch (error) {
    postMessage({
      id: message.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

/**
 * Matrix multiplication task: C[startRow:endRow] = A[startRow:endRow] * B
 */
function multiplyTask(task: any): void {
  const { aData, aRows, aCols, bData, bRows, bCols, startRow, endRow, resultData } = task

  for (let i = startRow; i < endRow; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0
      for (let k = 0; k < aCols; k++) {
        sum += aData[i * aCols + k] * bData[k * bCols + j]
      }
      resultData[i * bCols + j] = sum
    }
  }

  // No return needed, data is written to shared resultData
  return undefined
}

/**
 * Matrix addition task: C[start:end] = A[start:end] + B[start:end]
 */
function addTask(task: any): void {
  const { aData, bData, start, end, resultData } = task

  for (let i = start; i < end; i++) {
    resultData[i] = aData[i] + bData[i]
  }

  return undefined
}

/**
 * Matrix transpose task: B[j*rows+i] = A[i*cols+j] for i in [startRow:endRow]
 */
function transposeTask(task: any): void {
  const { data, rows, cols, startRow, endRow, resultData } = task

  for (let i = startRow; i < endRow; i++) {
    for (let j = 0; j < cols; j++) {
      resultData[j * rows + i] = data[i * cols + j]
    }
  }

  return undefined
}

/**
 * Dot product task: sum(A[start:end] * B[start:end])
 */
function dotProductTask(task: any): number {
  const { aData, bData, start, end } = task

  let sum = 0
  for (let i = start; i < end; i++) {
    sum += aData[i] * bData[i]
  }

  return sum
}

// Set up message listener based on environment
if (isNode) {
  // Node.js worker_threads
  const { parentPort } = require('worker_threads')
  if (parentPort) {
    parentPort.on('message', handleMessage)
  }
} else {
  // Browser Web Worker
  self.onmessage = handleMessage
}

export {} // Make this a module
