import { factory } from '../../utils/factory.ts'
import { isInteger } from '../../utils/number.ts'
import { product } from '../../utils/product.ts'

const name = 'combinationsWithRep'
const dependencies = ['typed']

export const createCombinationsWithRep = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: { typed: any }) => {
    /**
     * Compute the number of ways of picking `k` unordered outcomes from `n`
     * possibilities, allowing individual outcomes to be repeated more than once.
     *
     * CombinationsWithRep only takes integer arguments.
     * The following condition must be enforced: k <= n + k -1.
     *
     * Syntax:
     *
     *     math.combinationsWithRep(n, k)
     *
     * Examples:
     *
     *    math.combinationsWithRep(7, 5) // returns 462
     *
     * See also:
     *
     *    combinations, permutations, factorial
     *
     * @param {number | BigNumber} n    Total number of objects in the set
     * @param {number | BigNumber} k    Number of objects in the subset
     * @return {number | BigNumber}     Number of possible combinations with replacement.
     */
    return typed(name, {
      'number, number': function (n: number, k: number): number {
        if (!isInteger(n) || n < 0) {
          throw new TypeError(
            'Positive integer value expected in function combinationsWithRep'
          )
        }
        if (!isInteger(k) || k < 0) {
          throw new TypeError(
            'Positive integer value expected in function combinationsWithRep'
          )
        }
        if (n < 1) {
          throw new TypeError('k must be less than or equal to n + k - 1')
        }

        if (k < n - 1) {
          const prodrange = product(n, n + k - 1)
          return prodrange / product(1, k)
        }
        const prodrange = product(k + 1, n + k - 1)
        return prodrange / product(1, n - 1)
      },

      'BigNumber, BigNumber': function (n: any, k: any): any {
        const BigNumber = n.constructor
        let result: any, i: any
        const one = new BigNumber(1)
        const nMinusOne = n.minus(one)

        if (!isPositiveInteger(n) || !isPositiveInteger(k)) {
          throw new TypeError(
            'Positive integer value expected in function combinationsWithRep'
          )
        }
        if (n.lt(one)) {
          throw new TypeError(
            'k must be less than or equal to n + k - 1 in function combinationsWithRep'
          )
        }

        result = one
        if (k.lt(nMinusOne)) {
          for (i = one; i.lte(nMinusOne); i = i.plus(one)) {
            result = result.times(k.plus(i)).dividedBy(i)
          }
        } else {
          for (i = one; i.lte(k); i = i.plus(one)) {
            result = result.times(nMinusOne.plus(i)).dividedBy(i)
          }
        }

        return result
      }
    })
  }
)

/**
 * Test whether BigNumber n is a positive integer
 * @param {BigNumber} n
 * @returns {boolean} isPositiveInteger
 */
function isPositiveInteger(n: any): boolean {
  return n.isInteger() && n.gte(0)
}
