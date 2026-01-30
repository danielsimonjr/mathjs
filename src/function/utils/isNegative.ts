import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { isNegativeNumber } from '../../plain/number/index.ts'
import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.ts'
import { nearlyEqual } from '../../utils/number.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for isNegative
interface BigNumberType {
  constructor: new (value: number) => BigNumberType
  isNeg(): boolean
  isZero(): boolean
  isNaN(): boolean
}

interface FractionType {
  s: bigint
}

interface UnitType {
  valueType(): string
  value: unknown
}

interface IsNegativeDependencies {
  typed: TypedFunction
  config: ConfigOptions
}

const name = 'isNegative'
const dependencies = ['typed', 'config']

export const createIsNegative = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config }: IsNegativeDependencies) => {
    /**
     * Test whether a value is negative: smaller than zero.
     * The function supports types `number`, `BigNumber`, `Fraction`, and `Unit`.
     *
     * The function is evaluated element-wise in case of Array or Matrix input.
     *
     * Syntax:
     *
     *     math.isNegative(x)
     *
     * Examples:
     *
     *    math.isNegative(3)                     // returns false
     *    math.isNegative(-2)                    // returns true
     *    math.isNegative(0)                     // returns false
     *    math.isNegative(-0)                    // returns false
     *    math.isNegative(math.bignumber(2))     // returns false
     *    math.isNegative(math.fraction(-2, 5))  // returns true
     *    math.isNegative('-2')                  // returns true
     *    math.isNegative([2, 0, -3])            // returns [false, false, true]
     *
     * See also:
     *
     *    isNumeric, isPositive, isZero, isInteger
     *
     * @param {number | BigNumber | bigint | Fraction | Unit | Array | Matrix} x  Value to be tested
     * @return {boolean}  Returns true when `x` is larger than zero.
     *                    Throws an error in case of an unknown data type.
     */
    return typed(name, {
      number: (x: number): boolean =>
        nearlyEqual(x, 0, config.relTol, config.absTol)
          ? false
          : isNegativeNumber(x),

      BigNumber: (x: BigNumberType): boolean =>
        bigNearlyEqual(x, new x.constructor(0), config.relTol, config.absTol)
          ? false
          : x.isNeg() && !x.isZero() && !x.isNaN(),

      bigint: (x: bigint): boolean => x < 0n,

      Fraction: (x: FractionType): boolean => x.s < 0n, // It's enough to decide on the sign

      Unit: typed.referToSelf(
        (self: TypedFunction) => (x: UnitType): boolean => typed.find(self, x.valueType())(x.value)
      ),

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (x: unknown): unknown => deepMap(x, self)
      )
    })
  }
)
