import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for factorial
interface BigNumberType {
  plus(n: number): BigNumberType
  isNegative(): boolean
}

interface FactorialDependencies {
  typed: TypedFunction
  gamma: TypedFunction
}

const name = 'factorial'
const dependencies = ['typed', 'gamma']

export const createFactorial = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, gamma }: FactorialDependencies) => {
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

        return gamma(n + 1) as number
      },

      BigNumber: function (n: BigNumberType): unknown {
        if (n.isNegative()) {
          throw new Error('Value must be non-negative')
        }

        return gamma(n.plus(1))
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction): ((n: unknown) => unknown) =>
          (n: unknown): unknown =>
            deepMap(n as unknown[], self)
      )
    })
  }
)
