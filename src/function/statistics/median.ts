import { containsCollections } from '../../utils/collection.ts'
import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { improveErrorMessage } from './utils/improveErrorMessage.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for median
interface MatrixType {
  valueOf(): unknown[] | unknown[][]
}

interface MedianDependencies {
  typed: TypedFunction
  add: TypedFunction
  divide: TypedFunction
  compare: (a: unknown, b: unknown) => number
  partitionSelect: TypedFunction
}

const name = 'median'
const dependencies = ['typed', 'add', 'divide', 'compare', 'partitionSelect']

export const createMedian = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, add, divide, compare, partitionSelect }: MedianDependencies) => {
    /**
     * Recursively calculate the median of an n-dimensional array
     * @param {Array | Matrix} array - Input array or matrix
     * @return {number | BigNumber | Complex | Unit} median
     * @private
     */
    function _median(array: unknown[] | MatrixType): unknown {
      try {
        const flat = flatten((array as MatrixType).valueOf()) as unknown[]

        const num = flat.length
        if (num === 0) {
          throw new Error('Cannot calculate median of an empty array')
        }

        if (num % 2 === 0) {
          // even: return the average of the two middle values
          const mid = num / 2 - 1
          const right = partitionSelect(flat, mid + 1)

          // array now partitioned at mid + 1, take max of left part
          let left = flat[mid]
          for (let i = 0; i < mid; ++i) {
            if (compare(flat[i], left) > 0) {
              left = flat[i]
            }
          }

          return middle2(left, right)
        } else {
          // odd: return the middle value
          const m = partitionSelect(flat, (num - 1) / 2)

          return middle(m)
        }
      } catch (err) {
        throw improveErrorMessage(err, 'median', undefined)
      }
    }

    // helper function to type check the middle value of the array
    const middle = typed({
      'number | BigNumber | Complex | Unit': function (
        value: unknown
      ): unknown {
        return value
      }
    }) as (value: unknown) => unknown

    // helper function to type check the two middle value of the array
    const middle2 = typed({
      'number | BigNumber | Complex | Unit, number | BigNumber | Complex | Unit':
        function (left: unknown, right: unknown): unknown {
          return divide(add(left, right), 2)
        }
    }) as (left: unknown, right: unknown) => unknown

    /**
     * Compute the median of a matrix or a list with values. The values are
     * sorted and the middle value is returned. In case of an even number of
     * values, the average of the two middle values is returned.
     * Supported types of values are: Number, BigNumber, Unit
     *
     * In case of a (multi dimensional) array or matrix, the median of all
     * elements will be calculated.
     *
     * Syntax:
     *
     *     math.median(a, b, c, ...)
     *     math.median(A)
     *
     * Examples:
     *
     *     math.median(5, 2, 7)        // returns 5
     *     math.median([3, -1, 5, 7])  // returns 4
     *
     * See also:
     *
     *     mean, min, max, sum, prod, std, variance, quantileSeq
     *
     * @param {... *} args  A single matrix or or multiple scalar values
     * @return {*} The median
     */
    return typed(name, {
      // median([a, b, c, d, ...])
      'Array | Matrix': _median,

      // median([a, b, c, d, ...], dim)
      'Array | Matrix, number | BigNumber': function (
        _array: unknown[] | MatrixType,
        _dim: number | { valueOf(): number }
      ): unknown {
        // TODO: implement median(A, dim)
        throw new Error('median(A, dim) is not yet supported')
        // return reduce(arguments[0], arguments[1], ...)
      },

      // median(a, b, c, d, ...)
      '...': function (args: unknown[]): unknown {
        if (containsCollections(args)) {
          throw new TypeError('Scalar values expected in function median')
        }

        return _median(args)
      }
    })
  }
)
