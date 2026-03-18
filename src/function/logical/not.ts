import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { notNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for logical not operation
interface Complex {
  re: number
  im: number
}

interface BigNumber {
  isZero(): boolean
  isNaN(): boolean
}

interface Unit {
  value: number | BigNumber | Complex | null
  valueType(): string
}

interface Matrix {
  valueOf(): unknown[][]
}

interface NotDependencies {
  typed: TypedFunction
}

const name = 'not'
const dependencies = ['typed']

export const createNot = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: NotDependencies) => {
    /**
     * Logical `not`. Flips boolean value of a given parameter.
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.not(x)
     *
     * Examples:
     *
     *    math.not(2)      // returns false
     *    math.not(0)      // returns true
     *    math.not(true)   // returns false
     *
     *    a = [2, -7, 0]
     *    math.not(a)      // returns [false, false, true]
     *
     * See also:
     *
     *    and, or, xor
     *
     * @param  {number | BigNumber | bigint | Complex | Unit | Array | Matrix} x First value to check
     * @return {boolean | Array | Matrix}
     *            Returns true when input is a zero or empty value.
     */
    return typed(name, {
      'null | undefined': (): boolean => true,

      number: notNumber,

      Complex: function (x: Complex): boolean {
        return x.re === 0 && x.im === 0
      },

      BigNumber: function (x: BigNumber): boolean {
        return x.isZero() || x.isNaN()
      },

      bigint: (x: bigint): boolean => !x,

      Unit: typed.referToSelf(
        (self: TypedFunction) =>
          (x: Unit): boolean =>
            typed.find(self, x.valueType())(x.value)
      ),

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown[] | Matrix): unknown[] | Matrix =>
            deepMap(x, self)
      )
    })
  }
)
