import {
  containsCollections,
  deepForEach,
  reduce
} from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'

// Type definitions for statistical operations
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface Matrix {
  valueOf(): any[] | any[][]
}

interface Config {
  number?: string
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  add: TypedFunction
  numeric: TypedFunction
  parseNumberWithConfig: TypedFunction
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
  ({ typed, config, add, numeric, parseNumberWithConfig }: Dependencies) => {
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
      string: function (x: string): any {
        return parseNumberWithConfig(x)
      },

      // sum([a, b, c, d, ...])
      'Array | Matrix': _sum,

      // sum([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': _nsumDim,

      // sum(a, b, c, d, ...)
      '...': function (args: any[]): any {
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
    function _sum(array: any[] | Matrix): any {
      let sum: any

      deepForEach(array as any, function (value: any) {
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
    function _nsumDim(array: any[] | Matrix, dim: number | any): any {
      try {
        const sum = reduce(array as any, dim, add)
        return sum
      } catch (err) {
        throw improveErrorMessage(err, 'sum', undefined)
      }
    }
  }
)
