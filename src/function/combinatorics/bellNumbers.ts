import { factory } from '../../utils/factory.js'

const name = 'bellNumbers'
const dependencies = ['typed', 'addScalar', 'isNegative', 'isInteger', 'stirlingS2'] as const

export const createBellNumbers = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  addScalar,
  isNegative,
  isInteger,
  stirlingS2
}: any) => {
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
    'number | BigNumber': function (n: number | any): number | any {
      if (!isInteger(n) || isNegative(n)) {
        throw new TypeError('Non-negative integer value expected in function bellNumbers')
      }

      // Sum (k=0, n) S(n,k).
      let result: number | any = 0
      for (let i = 0; i <= n; i++) {
        result = addScalar(result, stirlingS2(n, i))
=======
        result = addScalar(result, stirlingS2(n, i))
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
      }

      return result
    }
  })
})
