import { deepForEach } from '../../utils/collection.js'
import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'

const name = 'multinomial'
<<<<<<< HEAD
const dependencies = ['typed', 'add', 'divide', 'multiply', 'factorial', 'isInteger', 'isPositive']
=======
const dependencies = ['typed', 'add', 'divide', 'multiply', 'factorial', 'isInteger', 'isPositive'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createMultinomial: FactoryFunction<
  {
    typed: TypedFunction
    add: TypedFunction
    divide: TypedFunction
    multiply: TypedFunction
    factorial: TypedFunction
    isInteger: TypedFunction
    isPositive: TypedFunction
  },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed, add, divide, multiply, factorial, isInteger, isPositive }) => {
  /**
   * Multinomial Coefficients compute the number of ways of picking a1, a2, ..., ai unordered outcomes from `n` possibilities.
   *
   * multinomial takes one array of integers as an argument.
   * The following condition must be enforced: every ai <= 0
   *
   * Syntax:
   *
   *     math.multinomial(a) // a is an array type
   *
   * Examples:
   *
   *    math.multinomial([1,2,1]) // returns 12
   *
   * See also:
   *
   *    combinations, factorial
   *
   * @param {number[] | BigNumber[]} a    Integer numbers of objects in the subset
   * @return {Number | BigNumber}         Multinomial coefficient.
   */
  return typed(name, {
    'Array | Matrix': function (a: any): any {
      let sum: any = 0
      let denom: any = 1

      deepForEach(a, function (ai: any) {
        if (!isInteger(ai) || !isPositive(ai)) {
          throw new TypeError('Positive integer value expected in function multinomial')
        }
<<<<<<< HEAD
        sum = (add as any)(sum, ai)
        denom = (multiply as any)(denom, (factorial as any)(ai))
      })

      return (divide as any)((factorial as any)(sum), denom)
=======
        sum = add(sum, ai)
        denom = multiply(denom, factorial(ai))
      })

      return divide(factorial(sum), denom)
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
    }
  })
})
