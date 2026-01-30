import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for mad
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface MadDependencies {
  typed: TypedFunction
  abs: TypedFunction
  map: TypedFunction
  median: TypedFunction
  subtract: TypedFunction
}

// Minimum array length for WASM to be beneficial
const WASM_MAD_THRESHOLD = 500

/**
 * Check if an array contains only plain numbers
 */
function isPlainNumberArray(arr: unknown[]): arr is number[] {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number') {
      return false
    }
  }
  return true
}

const name = 'mad'
const dependencies = ['typed', 'abs', 'map', 'median', 'subtract']

export const createMad = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, abs, map, median, subtract }: MadDependencies) => {
    /**
     * Compute the median absolute deviation of a matrix or a list with values.
     * The median absolute deviation is defined as the median of the absolute
     * deviations from the median.
     *
     * Syntax:
     *
     *     math.mad(a, b, c, ...)
     *     math.mad(A)
     *
     * Examples:
     *
     *     math.mad(10, 20, 30)             // returns 10
     *     math.mad([1, 2, 3])              // returns 1
     *     math.mad([[1, 2, 3], [4, 5, 6]]) // returns 1.5
     *
     * See also:
     *
     *     median, mean, std, abs
     *
     * @param {Array | Matrix} array
     *                        A single matrix or multiple scalar values.
     * @return {*} The median absolute deviation.
     */
    return typed(name, {
      // mad([a, b, c, d, ...])
      'Array | Matrix': _mad,

      // mad(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        return _mad(args)
      }
    })

    /**
     * Calculate the median absolute deviation
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} The median absolute deviation
     * @private
     */
    function _mad(array: unknown[] | MatrixType): unknown {
      const flat = flatten((array as MatrixType).valueOf()) as unknown[]

      if (flat.length === 0) {
        throw new Error(
          'Cannot calculate median absolute deviation (mad) of an empty array'
        )
      }

      // Try WASM for large arrays with plain numbers
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        flat.length >= WASM_MAD_THRESHOLD &&
        isPlainNumberArray(flat)
      ) {
        try {
          const aAlloc = wasmLoader.allocateFloat64Array(flat)

          try {
            const result = wasm.statsMad(aAlloc.ptr, flat.length)
            return result
          } finally {
            wasmLoader.free(aAlloc.ptr)
          }
        } catch {
          // Fall back to JS implementation on WASM error
        }
      }

      try {
        const med = median(flat)
        return median(
          map(flat, function (value: unknown): unknown {
            return abs(subtract(value, med))
          })
        )
      } catch (err) {
        if (err instanceof TypeError && err.message.includes('median')) {
          throw new TypeError(err.message.replace('median', 'mad'))
        } else {
          throw improveErrorMessage(err, 'mad', undefined)
        }
      }
    }
  }
)
