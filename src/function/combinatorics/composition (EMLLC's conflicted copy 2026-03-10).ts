import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for combinatorics
interface BigNumberType {
  // BigNumber placeholder for type compatibility
}

type NumericValue = number | BigNumberType

interface CompositionDependencies {
  typed: TypedFunction
  addScalar: (x: NumericValue, y: NumericValue) => NumericValue
  combinations: (n: NumericValue, k: NumericValue) => NumericValue
  isPositive: (x: NumericValue) => boolean
  isNegative: (x: NumericValue) => boolean
  isInteger: (x: NumericValue) => boolean
  larger: (x: NumericValue, y: NumericValue) => boolean
}

const name = 'composition'
const dependencies = [
  'typed',
  'addScalar',
  'combinations',
  'isNegative',
  'isPositive',
  'isInteger',
  'larger'
]

export const createComposition = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    addScalar,
    combinations,
    isPositive,
    isNegative: _isNegative,
    isInteger,
    larger
  }: CompositionDependencies) => {
    /**
     * The composition counts of n into k parts.
     *
     * composition only takes integer arguments.
     * The following condition must be enforced: k <= n.
     *
     * Syntax:
     *
     *   math.composition(n, k)
     *
     * Examples:
     *
     *    math.composition(5, 3) // returns 6
     *
     * See also:
     *
     *    combinations
     *
     * @param {Number | BigNumber} n    Total number of objects in the set
     * @param {Number | BigNumber} k    Number of objects in the subset
     * @return {Number | BigNumber}     Returns the composition counts of n into k parts.
     */
    return typed(name, {
      'number | BigNumber, number | BigNumber': function (
        n: NumericValue,
        k: NumericValue
      ): NumericValue {
        if (
          !isInteger(n) ||
          !isPositive(n) ||
          !isInteger(k) ||
          !isPositive(k)
        ) {
          throw new TypeError(
            'Positive integer value expected in function composition'
          )
        } else if (larger(k, n)) {
          throw new TypeError(
            'k must be less than or equal to n in function composition'
          )
        }

        return combinations(addScalar(n, -1), addScalar(k, -1))
      }
    })
  }
)
