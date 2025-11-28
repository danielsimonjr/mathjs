import { factory } from '../../../utils/factory.js'
import { deepMap } from '../../../utils/collection.js'
import type { MathCollection } from '../../../types.js'
import type Fraction from 'fraction.js'
import type { TypedFunction } from '../../../core/function/typed.js'

const name = 'fraction'
const dependencies = ['typed', 'Fraction'] as const

export const createFraction = /* #__PURE__ */ factory(name, dependencies, ({ typed, Fraction }): TypedFunction => {
  /**
   * Create a fraction or convert a value to a fraction.
   *
   * With one numeric argument, produces the closest rational approximation to the
   * input.
   * With two arguments, the first is the numerator and the second is the denominator,
   * and creates the corresponding fraction. Both numerator and denominator must be
   * integers.
   * With one object argument, looks for the integer numerator as the value of property
   * 'n' and the integer denominator as the value of property 'd'.
   * With a matrix argument, creates a matrix of the same shape with entries
   * converted into fractions.
   *
   * Syntax:
   *     math.fraction(value)
   *     math.fraction(numerator, denominator)
   *     math.fraction({n: numerator, d: denominator})
   *     math.fraction(matrix: Array | Matrix)
   *
   * Examples:
   *
   *     math.fraction(6.283)             // returns Fraction 6283/1000
   *     math.fraction(1, 3)              // returns Fraction 1/3
   *     math.fraction('2/3')             // returns Fraction 2/3
   *     math.fraction({n: 2, d: 3})      // returns Fraction 2/3
   *     math.fraction([0.2, 0.25, 1.25]) // returns Array [1/5, 1/4, 5/4]
   *     math.fraction(4, 5.1)            // throws Error: Parameters must be integer
   *
   * See also:
   *
   *    bignumber, number, string, unit
   *
   * @param {number | string | Fraction | BigNumber | bigint | Unit | Array | Matrix} [args]
   *            Arguments specifying the value, or numerator and denominator of
   *            the fraction
   * @return {Fraction | Array | Matrix} Returns a fraction
   */
  return typed('fraction', {
    number: function (x: number): Fraction {
      if (!Number.isFinite(x) || isNaN(x)) {
        throw new Error(x + ' cannot be represented as a fraction')
      }

      return new Fraction(x)
    },

    string: function (x: string): Fraction {
      return new Fraction(x)
    },

    'number, number': function (numerator: number, denominator: number): Fraction {
      return new Fraction(numerator, denominator)
    },

    'bigint, bigint': function (numerator: bigint, denominator: bigint): Fraction {
      return new Fraction(numerator, denominator)
    },

    null: function (x: null): Fraction {
      return new Fraction(0)
    },

    BigNumber: function (x: any): Fraction {
      return new Fraction(x.toString())
    },

    bigint: function (x: bigint): Fraction {
      return new Fraction(x.toString())
    },

    Fraction: function (x: Fraction): Fraction {
      return x // fractions are immutable
    },

    Unit: typed.referToSelf(self => (x: any): any => {
      const clone = x.clone()
      clone.value = self(x.value)
      return clone
    }),

    Object: function (x: any): Fraction {
      return new Fraction(x)
    },

    'Array | Matrix': typed.referToSelf(self => (x: MathCollection): MathCollection => deepMap(x, self))
  })
})

declare module '../../../types.js' {
  interface FactoryFunctionMap {
    fraction: typeof createFraction
  }
}
