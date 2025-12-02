import { deepMap } from '../../utils/collection.js'
import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'

const name = 'factorial'
<<<<<<< HEAD
const dependencies = ['typed', 'gamma']
=======
const dependencies = ['typed', 'gamma'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createFactorial: FactoryFunction<
  { typed: TypedFunction; gamma: TypedFunction },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed, gamma }) => {
  /**
   * Compute the factorial of a value
   *
   * Factorial only supports an integer value as argument.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.factorial(n)
   *
   * Examples:
   *
   *    math.factorial(5)    // returns 120
   *    math.factorial(3)    // returns 6
   *
   * See also:
   *
   *    combinations, combinationsWithRep, gamma, permutations
   *
   * @param {number | BigNumber | Array | Matrix} n   An integer number
   * @return {number | BigNumber | Array | Matrix}    The factorial of `n`
   */
  return typed(name, {
    number: function (n: number): number {
      if (n < 0) {
        throw new Error('Value must be non-negative')
      }

<<<<<<< HEAD
      return (gamma as any)(n + 1)
=======
      return gamma(n + 1)
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
    },

    BigNumber: function (n: any): any {
      if (n.isNegative()) {
        throw new Error('Value must be non-negative')
      }

      return gamma(n.plus(1))
    },

<<<<<<< HEAD
    'Array | Matrix': typed.referToSelf((self: TypedFunction): any => (n: any): any => deepMap(n, self))
=======
    'Array | Matrix': typed.referToSelf((self: TypedFunction) => (n: any): any => deepMap(n, self))
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
  })
})
