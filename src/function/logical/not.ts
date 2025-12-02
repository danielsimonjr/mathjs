import { deepMap } from '../../utils/collection.js'
import { factory } from '../../utils/factory.js'
import { notNumber } from '../../plain/number/index.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  referToSelf(fn: (self: any) => any): any
  find(signatures: any, signature: string): any
}

interface Complex {
  re: number
  im: number
}

interface BigNumber {
  isZero(): boolean
  isNaN(): boolean
}

interface Unit {
  value: any
  valueType(): string
}

interface Dependencies {
  typed: TypedFunction
}

const name = 'not'
const dependencies = ['typed']

export const createNot = /* #__PURE__ */ factory(name, dependencies, ({ typed }: Dependencies) => {
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

    Unit: typed.referToSelf(self => (x: Unit): any => typed.find(self, x.valueType())(x.value)),

    'Array | Matrix': typed.referToSelf(self => (x: any): any => deepMap(x, self))
  })
})
