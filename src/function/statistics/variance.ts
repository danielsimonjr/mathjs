import { deepForEach } from '../../utils/collection.ts'
import { isBigNumber } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for variance
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
  length?: number
}

interface VarianceDependencies {
  typed: TypedFunction
  add: TypedFunction
  subtract: TypedFunction
  multiply: TypedFunction
  divide: TypedFunction
  mapSlices: TypedFunction
  isNaN: TypedFunction
}

type NormalizationType = 'unbiased' | 'uncorrected' | 'biased'

const DEFAULT_NORMALIZATION: NormalizationType = 'unbiased'

const name = 'variance'
const dependencies = [
  'typed',
  'add',
  'subtract',
  'multiply',
  'divide',
  'mapSlices',
  'isNaN'
]

export const createVariance = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    add,
    subtract,
    multiply,
    divide,
    mapSlices,
    isNaN: mathIsNaN
  }: VarianceDependencies) => {
    /**
     * Compute the variance of a matrix or a  list with values.
     * In case of a multidimensional array or matrix, the variance over all
     * elements will be calculated.
     *
     * Additionally, it is possible to compute the variance along the rows
     * or columns of a matrix by specifying the dimension as the second argument.
     *
     * Optionally, the type of normalization can be specified as the final
     * parameter. The parameter `normalization` can be one of the following values:
     *
     * - 'unbiased' (default) The sum of squared errors is divided by (n - 1)
     * - 'uncorrected'        The sum of squared errors is divided by n
     * - 'biased'             The sum of squared errors is divided by (n + 1)
     *
     *
     * Note that older browser may not like the variable name `var`. In that
     * case, the function can be called as `math['var'](...)` instead of
     * `math.var(...)`.
     *
     * Syntax:
     *
     *     math.variance(a, b, c, ...)
     *     math.variance(A)
     *     math.variance(A, normalization)
     *     math.variance(A, dimension)
     *     math.variance(A, dimension, normalization)
     *
     * Examples:
     *
     *     math.variance(2, 4, 6)                     // returns 4
     *     math.variance([2, 4, 6, 8])                // returns 6.666666666666667
     *     math.variance([2, 4, 6, 8], 'uncorrected') // returns 5
     *     math.variance([2, 4, 6, 8], 'biased')      // returns 4
     *
     *     math.variance([[1, 2, 3], [4, 5, 6]])      // returns 3.5
     *     math.variance([[1, 2, 3], [4, 6, 8]], 0)   // returns [4.5, 8, 12.5]
     *     math.variance([[1, 2, 3], [4, 6, 8]], 1)   // returns [1, 4]
     *     math.variance([[1, 2, 3], [4, 6, 8]], 1, 'biased') // returns [0.5, 2]
     *
     * See also:
     *
     *    mean, median, max, min, prod, std, sum
     *
     * @param {Array | Matrix} array
     *                        A single matrix or or multiple scalar values
     * @param {string} [normalization='unbiased']
     *                        Determines how to normalize the variance.
     *                        Choose 'unbiased' (default), 'uncorrected', or 'biased'.
     * @param dimension {number | BigNumber}
     *                        Determines the axis to compute the variance for a matrix
     * @return {*} The variance
     */
    return typed(name, {
      // variance([a, b, c, d, ...])
      'Array | Matrix': function (array: unknown[] | MatrixType): unknown {
        return _var(array, DEFAULT_NORMALIZATION)
      },

      // variance([a, b, c, d, ...], normalization)
      'Array | Matrix, string': _var,

      // variance([a, b, c, c, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        array: unknown[] | MatrixType,
        dim: number | { valueOf(): number }
      ): unknown {
        return _varDim(array, dim, DEFAULT_NORMALIZATION)
      },

      // variance([a, b, c, c, ...], dim, normalization)
      'Array | Matrix, number | BigNumber, string': _varDim,

      // variance(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        return _var(args, DEFAULT_NORMALIZATION)
      }
    })

    /**
     * Recursively calculate the variance of an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @param {NormalizationType} normalization
     *                        Determines how to normalize the variance:
     *                        - 'unbiased'    The sum of squared errors is divided by (n - 1)
     *                        - 'uncorrected' The sum of squared errors is divided by n
     *                        - 'biased'      The sum of squared errors is divided by (n + 1)
     * @return {number | BigNumber} variance
     * @private
     */
    function _var(
      array: unknown[] | MatrixType,
      normalization: NormalizationType
    ): unknown {
      let sum: unknown
      let num = 0

      if ((array as unknown[]).length === 0) {
        throw new SyntaxError(
          'Function variance requires one or more parameters (0 provided)'
        )
      }

      // calculate the mean and number of elements
      deepForEach(array, function (value: unknown) {
        try {
          sum = sum === undefined ? value : add(sum, value)
          num++
        } catch (err) {
          throw improveErrorMessage(err, 'variance', value)
        }
      })
      if (num === 0)
        throw new Error('Cannot calculate variance of an empty array')

      const mean = divide(sum, num)

      // calculate the variance
      sum = undefined
      deepForEach(array, function (value: unknown) {
        const diff = subtract(value, mean)
        sum =
          sum === undefined
            ? multiply(diff, diff)
            : add(sum, multiply(diff, diff))
      })

      if (mathIsNaN(sum)) {
        return sum
      }

      switch (normalization) {
        case 'uncorrected':
          return divide(sum, num)

        case 'biased':
          return divide(sum, num + 1)

        case 'unbiased': {
          const zero = isBigNumber(sum) ? (sum as unknown as { mul(n: number): unknown }).mul(0) : 0
          return num === 1 ? zero : divide(sum, num - 1)
        }

        default:
          throw new Error(
            'Unknown normalization "' +
              normalization +
              '". ' +
              'Choose "unbiased" (default), "uncorrected", or "biased".'
          )
      }
    }

    /**
     * Calculate variance along a specific dimension
     * @param {Array | Matrix} array - Input array or matrix
     * @param {number | BigNumber} dim - Dimension along which to compute variance
     * @param {NormalizationType} normalization - Type of normalization
     * @return {Array | Matrix} variance along the specified dimension
     * @private
     */
    function _varDim(
      array: unknown[] | MatrixType,
      dim: number | { valueOf(): number },
      normalization: NormalizationType
    ): unknown {
      try {
        if ((array as unknown[]).length === 0) {
          throw new SyntaxError(
            'Function variance requires one or more parameters (0 provided)'
          )
        }
        return mapSlices(array, dim, (x: unknown) => _var(x as unknown[] | MatrixType, normalization))
      } catch (err) {
        throw improveErrorMessage(err, 'variance', undefined)
      }
    }
  }
)
