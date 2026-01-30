import {
  containsCollections,
  deepForEach,
  reduce
} from '../../utils/collection.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for mean
interface MatrixType {
  size(): number[]
  valueOf(): unknown[] | unknown[][]
}

interface MeanDependencies {
  typed: TypedFunction
  add: TypedFunction
  divide: TypedFunction
}

const name = 'mean'
const dependencies = ['typed', 'add', 'divide']

export const createMean = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, add, divide }: MeanDependencies) => {
    /**
     * Compute the mean value of matrix or a list with values.
     * In case of a multidimensional array, the mean of the flattened array
     * will be calculated. When `dim` is provided, the maximum over the selected
     * dimension will be calculated. Parameter `dim` is zero-based.
     *
     * Syntax:
     *
     *     math.mean(a, b, c, ...)
     *     math.mean(A)
     *     math.mean(A, dimension)
     *
     * Examples:
     *
     *     math.mean(2, 1, 4, 3)                     // returns 2.5
     *     math.mean([1, 2.7, 3.2, 4])               // returns 2.725
     *
     *     math.mean([[2, 5], [6, 3], [1, 7]], 0)    // returns [3, 5]
     *     math.mean([[2, 5], [6, 3], [1, 7]], 1)    // returns [3.5, 4.5, 4]
     *
     * See also:
     *
     *    median, min, max, sum, prod, std, variance
     *
     * @param {... *} args  A single matrix or or multiple scalar values
     * @return {*} The mean of all values
     */
    return typed(name, {
      // mean([a, b, c, d, ...])
      'Array | Matrix': _mean,

      // mean([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': _nmeanDim,

      // mean(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        if (containsCollections(args)) {
          throw new TypeError('Scalar values expected in function mean')
        }

        return _mean(args)
      }
    })

    /**
     * Calculate the mean value in an n-dimensional array, returning a
     * n-1 dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @param {number | BigNumber} dim - Dimension along which to compute mean
     * @return {number | BigNumber | Array | Matrix} mean
     * @private
     */
    function _nmeanDim(array: unknown[] | MatrixType, dim: number | { valueOf(): number }): unknown {
      try {
        const sum = reduce(array, dim, add)
        const s = Array.isArray(array) ? arraySize(array) : (array as MatrixType).size()
        const dimValue = typeof dim === 'number' ? dim : dim.valueOf()
        return divide(sum, s[dimValue])
      } catch (err) {
        throw improveErrorMessage(err, 'mean', undefined)
      }
    }

    /**
     * Recursively calculate the mean value in an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex} mean
     * @private
     */
    function _mean(array: unknown[] | MatrixType): unknown {
      let sum: unknown
      let num = 0

      deepForEach(array, function (value: unknown) {
        try {
          sum = sum === undefined ? value : add(sum, value)
          num++
        } catch (err) {
          throw improveErrorMessage(err, 'mean', value)
        }
      })

      if (num === 0) {
        throw new Error('Cannot calculate the mean of an empty array')
      }
      return divide(sum, num)
    }
  }
)
