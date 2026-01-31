import { deepForEach } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Minimum array length for WASM to be beneficial
const WASM_PROD_THRESHOLD = 100

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

// Type definitions for prod
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface ProdDependencies {
  typed: TypedFunction
  config: ConfigOptions
  multiplyScalar: TypedFunction
  numeric: TypedFunction
  parseNumberWithConfig: (value: string) => unknown
}

const name = 'prod'
const dependencies = [
  'typed',
  'config',
  'multiplyScalar',
  'numeric',
  'parseNumberWithConfig'
]

export const createProd = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config: _config,
    multiplyScalar,
    numeric: _numeric,
    parseNumberWithConfig
  }: ProdDependencies) => {
    /**
     * Compute the product of a matrix or a list with values.
     * In case of a multidimensional array or matrix, the sum of all
     * elements will be calculated.
     *
     * Syntax:
     *
     *     math.prod(a, b, c, ...)
     *     math.prod(A)
     *
     * Examples:
     *
     *     math.multiply(2, 3)           // returns 6
     *     math.prod(2, 3)               // returns 6
     *     math.prod(2, 3, 4)            // returns 24
     *     math.prod([2, 3, 4])          // returns 24
     *     math.prod([[2, 5], [4, 3]])   // returns 120
     *
     * See also:
     *
     *    mean, median, min, max, sum, std, variance
     *
     * @param {... *} args  A single matrix or or multiple scalar values
     * @return {*} The product of all values
     */
    return typed(name, {
      // prod(string) - single string input
      string: function (x: string): unknown {
        return parseNumberWithConfig(x)
      },

      // prod([a, b, c, d, ...])
      'Array | Matrix': _prod,

      // prod([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        _array: unknown[] | MatrixType,
        _dim: number | { valueOf(): number }
      ): unknown {
        // TODO: implement prod(A, dim)
        throw new Error('prod(A, dim) is not yet supported')
        // return reduce(arguments[0], arguments[1], math.prod)
      },

      // prod(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        return _prod(args)
      }
    })

    /**
     * Recursively calculate the product of an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} prod
     * @private
     */
    function _prod(array: unknown[] | MatrixType): unknown {
      // WASM fast path for flat arrays of plain numbers
      if (Array.isArray(array) && array.length >= WASM_PROD_THRESHOLD) {
        if (isFlatNumberArray(array)) {
          const wasm = wasmLoader.getModule()
          if (wasm) {
            try {
              const alloc = wasmLoader.allocateFloat64Array(array)
              try {
                return wasm.statsProd(alloc.ptr, array.length)
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
      let prod: unknown

      deepForEach(array, function (value: unknown) {
        try {
          // Pre-convert string inputs BEFORE multiplication
          const converted =
            typeof value === 'string' ? parseNumberWithConfig(value) : value

          prod =
            prod === undefined ? converted : multiplyScalar(prod, converted)
        } catch (err) {
          throw improveErrorMessage(err, 'prod', value)
        }
      })

      if (prod === undefined) {
        throw new Error('Cannot calculate prod of an empty array')
      }

      return prod
    }
  }
)
