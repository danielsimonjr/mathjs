import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import * as loader from '@assemblyscript/loader'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function test() {
  const wasmPath = join(__dirname, '../../lib/wasm/index.wasm')
  const wasmBuffer = await readFile(wasmPath)

  console.log('Loading WASM with AssemblyScript loader...')

  const module = await loader.instantiate(wasmBuffer, {
    env: {
      abort: (msg, file, line, column) => {
        console.error(`WASM abort at ${line}:${column}`)
      },
      seed: () => Date.now()
    }
  })

  const exports = module.exports
  const memory = exports.memory

  // Test 1: Direct memory manipulation for Float64Array
  console.log('\n=== Test 1: Direct memory access ===')

  // Allocate a Float64Array manually
  // AssemblyScript arrays have a header, so we need to understand the layout
  const FLOAT64_SIZE = 8
  const values = [1.0, 2.0, 3.0, 4.0]
  const numBytes = values.length * FLOAT64_SIZE

  // Use __new to allocate raw bytes
  // classId 1 seems to be ArrayBuffer
  const ptr = exports.__new(numBytes, 1)
  console.log('Allocated raw buffer at:', ptr, 'aligned:', ptr % 8 === 0)

  // Write to memory
  const memoryView = new Float64Array(memory.buffer, ptr, values.length)
  values.forEach((v, i) => memoryView[i] = v)
  console.log('Wrote values to memory:', Array.from(memoryView))

  // Test 2: Try using type ID 4 with proper view
  console.log('\n=== Test 2: Type ID 4 with Float64ArrayView ===')
  try {
    const arrPtr = exports.__newArray(4, [1.0, 2.0, 3.0, 4.0])
    console.log('Created array at ptr:', arrPtr)
    exports.__pin(arrPtr)

    // Try __getFloat64ArrayView
    try {
      const view = exports.__getFloat64ArrayView(arrPtr)
      console.log('__getFloat64ArrayView:', view ? `[${Array.from(view).join(', ')}] length=${view.length}` : 'null')
    } catch (e) {
      console.log('__getFloat64ArrayView error:', e.message)
    }

    // Try __getArrayView
    try {
      const view = exports.__getArrayView(arrPtr)
      console.log('__getArrayView:', view.constructor.name, view ? `[${Array.from(view.slice(0,4)).join(', ')}] length=${view.length}` : 'null')
    } catch (e) {
      console.log('__getArrayView error:', e.message)
    }

    exports.__unpin(arrPtr)
  } catch (e) {
    console.log('Type ID 4 error:', e.message)
  }

  // Test 3: Look for Float64Array runtime ID in exports
  console.log('\n=== Test 3: Search for runtime type IDs ===')
  for (const key of Object.keys(exports)) {
    if (key.includes('ID') || key.includes('Id') || key.includes('_id')) {
      console.log(`  ${key}:`, exports[key])
    }
  }

  // Test 4: Try different array creation approach - pass values one by one
  console.log('\n=== Test 4: Testing dotProduct with raw memory ===')

  // The WASM dotProduct function signature: (aPtr: i32, bPtr: i32, n: i32) => f64
  // It expects pointers to Float64Array data

  // Allocate two aligned buffers
  const aValues = [1.0, 2.0, 3.0, 4.0]
  const bValues = [5.0, 6.0, 7.0, 8.0]
  const n = 4

  // Ensure 8-byte alignment
  let aPtr = exports.__new(n * 8, 0)
  if (aPtr % 8 !== 0) {
    aPtr = exports.__new(n * 8 + 4, 0)
    aPtr = aPtr + (8 - (aPtr % 8)) % 8
  }

  let bPtr = exports.__new(n * 8, 0)
  if (bPtr % 8 !== 0) {
    bPtr = exports.__new(n * 8 + 4, 0)
    bPtr = bPtr + (8 - (bPtr % 8)) % 8
  }

  console.log('aPtr:', aPtr, 'aligned:', aPtr % 8 === 0)
  console.log('bPtr:', bPtr, 'aligned:', bPtr % 8 === 0)

  // Write data
  const aView = new Float64Array(memory.buffer, aPtr, n)
  const bView = new Float64Array(memory.buffer, bPtr, n)
  aValues.forEach((v, i) => aView[i] = v)
  bValues.forEach((v, i) => bView[i] = v)

  console.log('A:', Array.from(aView))
  console.log('B:', Array.from(bView))

  // Try dotProduct with raw pointers
  try {
    const result = exports.dotProduct(aPtr, bPtr, n)
    console.log('dotProduct result:', result)
    console.log('Expected: 70 (1*5 + 2*6 + 3*7 + 4*8)')
  } catch (e) {
    console.log('dotProduct error:', e.message)
  }

  // Test 5: Check the actual WASM function signatures
  console.log('\n=== Test 5: WASM function signatures ===')
  console.log('dotProduct:', exports.dotProduct.toString().slice(0, 100))
  console.log('multiplyDense:', exports.multiplyDense.toString().slice(0, 100))

  // Test 6: Look at the WASM memory layout for typed arrays
  console.log('\n=== Test 6: ArrayBuffer based approach ===')

  // Create an ArrayBuffer with the correct data
  const abSize = n * FLOAT64_SIZE
  const abPtr = exports.__newArrayBuffer(abSize)
  console.log('ArrayBuffer ptr:', abPtr, 'aligned:', abPtr % 8 === 0)

  if (abPtr % 8 === 0) {
    const abView = new Float64Array(memory.buffer, abPtr, n)
    aValues.forEach((v, i) => abView[i] = v)
    console.log('ArrayBuffer data:', Array.from(abView))

    // Try dotProduct with ArrayBuffer ptr
    try {
      const result = exports.dotProduct(abPtr, abPtr, n)
      console.log('dotProduct(ab, ab):', result)
      console.log('Expected: 30 (1*1 + 2*2 + 3*3 + 4*4)')
    } catch (e) {
      console.log('dotProduct with ArrayBuffer error:', e.message)
    }
  }
}

test().catch(console.error)
