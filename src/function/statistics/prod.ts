import { deepForEach } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { safeNumberType } from '../../utils/number.ts'
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
  multiplyScalar: TypedFunction
  numeric: TypedFunction
  parseNumberWithConfig: TypedFunction
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
    config,
    multiplyScalar,
    numeric,
    parseNumberWithConfig
  }: Dependencies) => {
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
      string: function (x: string): any {
        return parseNumberWithConfig(x)
      },

      // prod([a, b, c, d, ...])
      'Array | Matrix': _prod,

      // prod([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        _array: any[] | Matrix,
        _dim: number | any
      ): any {
        // TODO: implement prod(A, dim)
        throw new Error('prod(A, dim) is not yet supported')
        // return reduce(arguments[0], arguments[1], math.prod)
      },

      // prod(a, b, c, d, ...)
      '...': function (args: any[]): any {
        return _prod(args)
      }
    })

    /**
     * Recursively calculate the product of an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} prod
     * @private
     */
    function _prod(array: any[] | Matrix): any {
      let prod: any

      deepForEach(array as any, function (value: any) {
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
