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

  console.log('\nModule keys:', Object.keys(module))
  console.log('\nExports keys:', Object.keys(module.exports))

  // Check for array creation functions
  const exports = module.exports
  console.log('\n__new:', typeof exports.__new)
  console.log('__pin:', typeof exports.__pin)
  console.log('__unpin:', typeof exports.__unpin)
  console.log('__newArray:', typeof exports.__newArray)
  console.log('__getArray:', typeof exports.__getArray)

  // Check loader utilities
  console.log('\nLoader utilities:')
  console.log('module.__newArray:', typeof module.__newArray)
  console.log('module.__getArray:', typeof module.__getArray)
  console.log('module.__pin:', typeof module.__pin)

  // Check Float64Array ID
  console.log('\nFloat64Array_ID:', module.Float64Array_ID)

  // Try to find how to create arrays
  if (exports.__new) {
    console.log('\nTrying to allocate memory...')
    // Allocate 8 bytes (1 float64)
    const ptr = exports.__new(8, 0)
    console.log('Allocated ptr:', ptr)
  }

  // Check if there's a different way to pass arrays
  console.log('\nLooking for array functions in exports:')
  for (const key of Object.keys(exports)) {
    if (key.includes('Array') || key.includes('array')) {
      console.log(`  ${key}: ${typeof exports[key]}`)
    }
  }

  // Try using dotProduct with __newArray and different access methods
  console.log('\nTrying dotProduct with __newArray...')
  if (exports.dotProduct && exports.__newArray) {
    try {
      console.log('Testing array creation with different type IDs and access methods...')

      for (let typeId = 1; typeId <= 10; typeId++) {
        try {
          const testPtr = exports.__newArray(typeId, [1.0, 2.0, 3.0, 4.0])
          console.log(`\ntypeId ${typeId}: created ptr ${testPtr}`)

          // Try __getArray (returns JS array)
          try {
            const jsArr = exports.__getArray(testPtr)
            console.log(`  __getArray: [${jsArr.slice(0, 4).join(', ')}] (length: ${jsArr.length})`)

            if (jsArr.length === 4) {
              // This type ID works! Test dotProduct
              const aPtr = exports.__newArray(typeId, [1.0, 2.0, 3.0, 4.0])
              const bPtr = exports.__newArray(typeId, [5.0, 6.0, 7.0, 8.0])

              exports.__pin(aPtr)
              exports.__pin(bPtr)

              const result = exports.dotProduct(aPtr, bPtr, 4)
              console.log(`  dotProduct result: ${result} (expected: 70)`)

              if (Math.abs(result - 70) < 0.001) {
                console.log(`\n*** SUCCESS! Float64Array type ID = ${typeId} ***`)
              }

              exports.__unpin(aPtr)
              exports.__unpin(bPtr)
            }
          } catch (e) {
            console.log(`  __getArray error: ${e.message}`)
          }

          // Try __getArrayView
          try {
            const view = exports.__getArrayView(testPtr)
            console.log(`  __getArrayView: ${view ? view.constructor.name : 'null'}`)
          } catch (e) {
            // skip
          }

        } catch (e) {
          console.log(`typeId ${typeId}: ${e.message}`)
        }
      }
    } catch (e) {
      console.log('Error:', e.message)
    }
  }

  // Try matrix multiply
  console.log('\nTrying multiplyDense...')
  if (exports.multiplyDense && exports.__newArray) {
    try {
      // 2x2 matrix multiply test
      const aData = [1, 2, 3, 4]  // [[1,2],[3,4]]
      const bData = [5, 6, 7, 8]  // [[5,6],[7,8]]

      // Find the right type ID (from above test)
      for (let typeId = 1; typeId <= 10; typeId++) {
        try {
          const testArr = exports.__getFloat64Array(exports.__newArray(typeId, [1.0]))
          if (testArr && testArr.length === 1) {
            const aPtr = exports.__newArray(typeId, aData)
            const bPtr = exports.__newArray(typeId, bData)

            exports.__pin(aPtr)
            exports.__pin(bPtr)

            // multiplyDense returns a new Float64Array
            const resultPtr = exports.multiplyDense(aPtr, 2, 2, bPtr, 2, 2)
            const result = exports.__getFloat64Array(resultPtr)

            console.log(`2x2 matrix multiply result: [${Array.from(result).join(', ')}]`)
            console.log(`Expected: [19, 22, 43, 50]`)  // [[1,2],[3,4]] * [[5,6],[7,8]]

            exports.__unpin(aPtr)
            exports.__unpin(bPtr)
            break
          }
        } catch (e) {
          // skip
        }
      }
    } catch (e) {
      console.log('Error:', e.message)
    }
  }
}

test().catch(console.error)
