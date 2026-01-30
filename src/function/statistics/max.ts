import {
  deepForEach,
  reduce,
  containsCollections
} from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { safeNumberType } from '../../utils/number.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for max
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface MaxDependencies {
  typed: TypedFunction
  config: ConfigOptions
  numeric: TypedFunction
  larger: TypedFunction
  isNaN: TypedFunction
}

const name = 'max'
const dependencies = ['typed', 'config', 'numeric', 'larger', 'isNaN']

export const createMax = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, numeric, larger, isNaN: mathIsNaN }: MaxDependencies) => {
    /**
     * Compute the maximum value of a matrix or a  list with values.
     * In case of a multidimensional array, the maximum of the flattened array
     * will be calculated. When `dim` is provided, the maximum over the selected
     * dimension will be calculated. Parameter `dim` is zero-based.
     *
     * Syntax:
     *
     *     math.max(a, b, c, ...)
     *     math.max(A)
     *     math.max(A, dimension)
     *
     * Examples:
     *
     *     math.max(2, 1, 4, 3)                  // returns 4
     *     math.max([2, 1, 4, 3])                // returns 4
     *
     *     // maximum over a specified dimension (zero-based)
     *     math.max([[2, 5], [4, 3], [1, 7]], 0) // returns [4, 7]
     *     math.max([[2, 5], [4, 3], [1, 7]], 1) // returns [5, 4, 7]
     *
     *     math.max(2.7, 7.1, -4.5, 2.0, 4.1)    // returns 7.1
     *     math.min(2.7, 7.1, -4.5, 2.0, 4.1)    // returns -4.5
     *
     * See also:
     *
     *    mean, median, min, prod, std, sum, variance
     *
     * @param {... *} args  A single matrix or or multiple scalar values
     * @return {*} The maximum value
     */
    return typed(name, {
      // max([a, b, c, d, ...])
      'Array | Matrix': _max,

      // max([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        array: unknown[] | MatrixType,
        dim: number | { valueOf(): number }
      ): unknown {
        const dimValue = typeof dim === 'number' ? dim : dim.valueOf()
        return reduce(array, dimValue, _largest)
      },

      // max(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        if (containsCollections(args)) {
          throw new TypeError('Scalar values expected in function max')
        }

        return _max(args)
      }
    })

    /**
     * Return the largest of two values
     * @param {unknown} x - First value
     * @param {unknown} y - Second value
     * @returns {unknown} Returns x when x is largest, or y when y is largest
     * @private
     */
    function _largest(x: unknown, y: unknown): unknown {
      try {
        return larger(x, y) ? x : y
      } catch (err) {
        throw improveErrorMessage(err, 'max', y)
      }
    }

    /**
     * Recursively calculate the maximum value in an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} max
     * @private
     */
    function _max(array: unknown[] | MatrixType): unknown {
      let res: unknown

      deepForEach(array, function (value: unknown) {
        try {
          if (mathIsNaN(value)) {
            res = value
          } else if (res === undefined || larger(value, res)) {
            res = value
          }
        } catch (err) {
          throw improveErrorMessage(err, 'max', value)
        }
      })

      if (res === undefined) {
        throw new Error('Cannot calculate max of an empty array')
      }

      // make sure returning numeric value: parse a string into a numeric value
      if (typeof res === 'string') {
        res = numeric(res, safeNumberType(res, config))
      }

      return res
    }
  }
)
