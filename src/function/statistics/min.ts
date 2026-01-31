import {
  containsCollections,
  deepForEach,
  reduce
} from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { safeNumberType } from '../../utils/number.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Minimum array length for WASM to be beneficial
const WASM_MIN_THRESHOLD = 100

/**
 * Check if an array is a flat array of plain numbers
 */
function isFlatNumberArray(arr: unknown[]): arr is number[] {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number') {
      return false
    }
  }
  return true
}

// Type definitions for min
interface MatrixType {
  forEach(
    callback: (value: unknown) => void,
    skipZeros: boolean,
    recurse: boolean
  ): void
  map(
    callback: (value: unknown) => unknown,
    skipZeros: boolean,
    recurse: boolean
  ): MatrixType
  size(): number[]
  valueOf(): unknown[] | unknown[][]
  create(data: unknown[], datatype?: string): MatrixType
  datatype(): string | undefined
}

interface MinDependencies {
  typed: TypedFunction
  config: ConfigOptions
  numeric: TypedFunction
  smaller: TypedFunction
  isNaN: TypedFunction
}

const name = 'min'
const dependencies = ['typed', 'config', 'numeric', 'smaller', 'isNaN']

export const createMin = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, numeric, smaller, isNaN: mathIsNaN }: MinDependencies) => {
    /**
     * Compute the minimum value of a matrix or a  list of values.
     * In case of a multidimensional array, the minimum of the flattened array
     * will be calculated. When `dim` is provided, the minimum over the selected
     * dimension will be calculated. Parameter `dim` is zero-based.
     *
     * Syntax:
     *
     *     math.min(a, b, c, ...)
     *     math.min(A)
     *     math.min(A, dimension)
     *
     * Examples:
     *
     *     math.min(2, 1, 4, 3)                  // returns 1
     *     math.min([2, 1, 4, 3])                // returns 1
     *
     *     // minimum over a specified dimension (zero-based)
     *     math.min([[2, 5], [4, 3], [1, 7]], 0) // returns [1, 3]
     *     math.min([[2, 5], [4, 3], [1, 7]], 1) // returns [2, 3, 1]
     *
     *     math.max(2.7, 7.1, -4.5, 2.0, 4.1)    // returns 7.1
     *     math.min(2.7, 7.1, -4.5, 2.0, 4.1)    // returns -4.5
     *
     * See also:
     *
     *    mean, median, max, prod, std, sum, variance
     *
     * @param {... *} args  A single matrix or or multiple scalar values
     * @return {*} The minimum value
     */
    return typed(name, {
      // min([a, b, c, d, ...])
      'Array | Matrix': _min,

      // min([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        array: unknown[] | MatrixType,
        dim: number | { valueOf(): number }
      ): unknown {
        const dimValue = typeof dim === 'number' ? dim : dim.valueOf()
        return reduce(array, dimValue, _smallest)
      },

      // min(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        if (containsCollections(args)) {
          throw new TypeError('Scalar values expected in function min')
        }

        return _min(args)
      }
    })

    /**
     * Return the smallest of two values
     * @param {unknown} x - First value
     * @param {unknown} y - Second value
     * @returns {unknown} Returns x when x is smallest, or y when y is smallest
     * @private
     */
    function _smallest(x: unknown, y: unknown): unknown {
      try {
        return smaller(x, y) ? x : y
      } catch (err) {
        throw improveErrorMessage(err, 'min', y)
      }
    }

    /**
     * Recursively calculate the minimum value in an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} min
     * @private
     */
    function _min(array: unknown[] | MatrixType): unknown {
      // WASM fast path for flat arrays of plain numbers
      if (Array.isArray(array) && array.length >= WASM_MIN_THRESHOLD) {
        if (isFlatNumberArray(array)) {
          const wasm = wasmLoader.getModule()
          if (wasm) {
            try {
              const alloc = wasmLoader.allocateFloat64Array(array)
              try {
                return wasm.statsMin(alloc.ptr, array.length)
              } finally {
                wasmLoader.free(alloc.ptr)
              }
            } catch {
              // Fall back to JS implementation on WASM error
            }
          }
        }
      }

      // JavaScript fallback for mixed types, BigNumber, Complex, etc.
      let min: unknown

      deepForEach(array, function (value: unknown) {
        try {
          if (mathIsNaN(value)) {
            min = value
          } else if (min === undefined || smaller(value, min)) {
            min = value
          }
        } catch (err) {
          throw improveErrorMessage(err, 'min', value)
        }
      })

      if (min === undefined) {
        throw new Error('Cannot calculate min of an empty array')
      }

      // make sure returning numeric value: parse a string into a numeric value
      if (typeof min === 'string') {
        min = numeric(min, safeNumberType(min, config))
      }

      return min
    }
  }
)
