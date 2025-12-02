import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'

const name = 'bellNumbers'
<<<<<<< HEAD
const dependencies = ['typed', 'addScalar', 'isNegative', 'isInteger', 'stirlingS2']
=======
const dependencies = ['typed', 'addScalar', 'isNegative', 'isInteger', 'stirlingS2'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createBellNumbers: FactoryFunction<
  {
    typed: TypedFunction
    addScalar: TypedFunction
    isNegative: TypedFunction
    isInteger: TypedFunction
    stirlingS2: TypedFunction
  },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed, addScalar, isNegative, isInteger, stirlingS2 }) => {
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
<<<<<<< HEAD
        result = (addScalar as any)(result, (stirlingS2 as any)(n, i))
=======
        result = addScalar(result, stirlingS2(n, i))
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
      }

      return result
    }
  })
})
