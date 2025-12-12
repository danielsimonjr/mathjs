import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

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

export const createComposition = /* #__PURE__ */ factory(name, dependencies, (
  {
    typed,
    addScalar,
    combinations,
    isPositive,
    isNegative,
    isInteger,
    larger
  }: {
    typed: any,
    addScalar: any,
    combinations: any,
    isPositive: any,
    isNegative: any,
    isInteger: any,
    larger: any
  }
) => {
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
    'number | BigNumber, number | BigNumber': function (n: any, k: any): any {
      if (!isInteger(n) || !isPositive(n) || !isInteger(k) || !isPositive(k)) {
        throw new TypeError('Positive integer value expected in function composition')
      } else if (larger(k, n)) {
        throw new TypeError('k must be less than or equal to n in function composition')
      }

      return combinations((addScalar as any)(n, -1), (addScalar as any)(k, -1))
    }
  })
})
