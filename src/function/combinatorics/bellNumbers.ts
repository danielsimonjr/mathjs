import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

const name = 'bellNumbers'
const dependencies = ['typed', 'addScalar', 'isNegative', 'isInteger', 'stirlingS2']

export const createBellNumbers = /* #__PURE__ */ factory(name, dependencies, ({ typed, addScalar, isNegative, isInteger, stirlingS2 }: { typed: any, addScalar: any, isNegative: any, isInteger: any, stirlingS2: any }) => {
  /**
   * The Bell Numbers count the number of partitions of a set. A partition is a pairwise disjoint subset of S whose union is S.
   * bellNumbers only takes integer arguments.
   * The following condition must be enforced: n >= 0
   *
   * Syntax:
   *
   *   math.bellNumbers(n)
   *
   * Examples:
   *
   *    math.bellNumbers(3) // returns 5
   *    math.bellNumbers(8) // returns 4140
   *
   * See also:
   *
   *    stirlingS2
   *
   * @param {Number | BigNumber} n    Total number of objects in the set
   * @return {Number | BigNumber}     B(n)
   */
  return typed(name, {
    'number | BigNumber': function (n: any): any {
      if (!isInteger(n) || isNegative(n)) {
        throw new TypeError('Non-negative integer value expected in function bellNumbers')
      }

      // Sum (k=0, n) S(n,k).
      let result: any = 0
      for (let i = 0; i <= n; i++) {
        result = (addScalar as any)(result, (stirlingS2 as any)(n, i))
      }

      return result
    }
  })
})
