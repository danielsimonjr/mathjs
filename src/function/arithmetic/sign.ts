import { factory } from '../../utils/factory.js'
import { deepMap } from '../../utils/collection.js'
import { signNumber } from '../../plain/number/index.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  referToSelf<U>(fn: (self: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
}

interface BigNumberConstructor {
  new (value: number): any
}

interface Complex {
  re: number
  im: number
  sign(): Complex
}

interface ComplexConstructor {
  (value: number): Complex
}

interface FractionConstructor {
  new (value: number): any
}

interface Unit {
  _isDerived(): boolean
  units: Array<{ unit: { offset: number } }>
  valueType(): string
  value: any
}

interface Dependencies {
  typed: TypedFunction
  BigNumber: BigNumberConstructor
  complex: ComplexConstructor
  Fraction: FractionConstructor
}

const name = 'sign'
const dependencies = ['typed', 'BigNumber', 'complex', 'Fraction']

export const createSign = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber, complex, Fraction }: Dependencies) => {
  /**
   * Compute the sign of a value. The sign of a value x is:
   *
   * -  1 when x > 0
   * - -1 when x < 0
   * -  0 when x == 0
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.sign(x)
   *
   * Examples:
   *
   *    math.sign(3.5)               // returns 1
   *    math.sign(-4.2)              // returns -1
   *    math.sign(0)                 // returns 0
   *
   *    math.sign([3, 5, -2, 0, 2])  // returns [1, 1, -1, 0, 1]
   *
   * See also:
   *
   *    abs
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Array | Matrix | Unit} x
   *            The number for which to determine the sign
   * @return {number | BigNumber | bigint | Fraction | Complex | Array | Matrix | Unit}
   *            The sign of `x`
   */
  return typed(name, {
    number: signNumber,

    Complex: function (x: Complex): Complex {
      return x.im === 0 ? complex(signNumber(x.re)) : x.sign()
    },

    BigNumber: function (x: any): any {
      return new BigNumber(x.cmp(0))
    },

    bigint: function (x: bigint): bigint {
      return x > 0n ? 1n : x < 0n ? -1n : 0n
    },

    Fraction: function (x: any): any {
      return x.n === 0n ? new Fraction(0) : new Fraction(x.s)
    },

    // deep map collection, skip zeros since sign(0) = 0
    'Array | Matrix': typed.referToSelf(((self: any) => ((x: any): any => deepMap(x, self, true))) as any) as any,

    Unit: (typed as any).referToSelf((self: any) => (x: Unit): any => {
      if (!(x as any)._isDerived() && (x as any).units[0].unit.offset !== 0) {
        throw new TypeError('sign is ambiguous for units with offset')
      }
      return (typed as any).find(self, (x as any).valueType())((x as any).value)
    })
  })
})
