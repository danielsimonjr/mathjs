import {
  containsCollections,
  deepForEach,
  reduce
} from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Minimum array length for WASM to be beneficial
const WASM_SUM_THRESHOLD = 100

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

// Type definitions for sum
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface SumDependencies {
  typed: TypedFunction
  config: ConfigOptions
  add: TypedFunction
  numeric: TypedFunction
  parseNumberWithConfig: (value: string) => unknown
}

const name = 'sum'
const dependencies = [
  'typed',
  'config',
  'add',
  'numeric',
  'parseNumberWithConfig'
]

export const createSum = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, add, numeric, parseNumberWithConfig }: SumDependencies) => {
    /**
     * Compute the sum of a matrix or a list with values.
     * In case of a multidimensional array or matrix, the sum of all
     * elements will be calculated.
     *
     * Syntax:
     *
     *     math.sum(a, b, c, ...)
     *     math.sum(A)
     *     math.sum(A, dimension)
     *
     * Examples:
     *
     *     math.sum(2, 1, 4, 3)               // returns 10
     *     math.sum([2, 1, 4, 3])             // returns 10
     *     math.sum([[2, 5], [4, 3], [1, 7]]) // returns 22
     *
     * See also:
     *
     *    mean, median, min, max, prod, std, variance, cumsum
     *
     * @param {... *} args  A single matrix or multiple scalar values
     * @return {*} The sum of all values
     */
    return typed(name, {
      // sum(string) - single string input
      string: function (x: string): unknown {
        return parseNumberWithConfig(x)
      },

      // sum([a, b, c, d, ...])
      'Array | Matrix': _sum,

      // sum([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': _nsumDim,

      // sum(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        if (containsCollections(args)) {
          throw new TypeError('Scalar values expected in function sum')
        }

        return _sum(args)
      }
    })

    /**
     * Recursively calculate the sum of an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} sum
     * @private
     */
    function _sum(array: unknown[] | MatrixType): unknown {
      // WASM fast path for flat arrays of plain numbers
      if (Array.isArray(array) && array.length >= WASM_SUM_THRESHOLD) {
        if (isFlatNumberArray(array)) {
          const wasm = wasmLoader.getModule()
          if (wasm) {
            try {
              const alloc = wasmLoader.allocateFloat64Array(array)
              try {
                return wasm.statsSum(alloc.ptr, array.length)
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
      let sum: unknown

      deepForEach(array, function (value: unknown) {
        try {
          // Pre-convert string inputs BEFORE addition
          const converted =
            typeof value === 'string' ? parseNumberWithConfig(value) : value

          sum = sum === undefined ? converted : add(sum, converted)
        } catch (err) {
          throw improveErrorMessage(err, 'sum', value)
        }
      })

      // Return 0 (in configured type) for empty arrays
      if (sum === undefined) {
        sum = numeric(0, config.number)
      }

      return sum
    }

    /**
     * Calculate sum along a specified dimension
     * @param {Array | Matrix} array - Input array or matrix
     * @param {number | BigNumber} dim - Dimension to sum along
     * @return {number | BigNumber | Complex | Unit | Array | Matrix} sum
     * @private
     */
    function _nsumDim(array: unknown[] | MatrixType, dim: number | { valueOf(): number }): unknown {
      try {
        const sum = reduce(array, dim, add)
        return sum
      } catch (err) {
        throw improveErrorMessage(err, 'sum', undefined)
      }
    }
  }
)
