import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { isNaNNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for isNaN
interface BigNumberType {
  isNaN(): boolean
}

interface ComplexType {
  isNaN(): boolean
}

interface UnitType {
  value: number
}

interface IsNaNDependencies {
  typed: TypedFunction
}

const name = 'isNaN'
const dependencies = ['typed']

export const createIsNaN = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: IsNaNDependencies) => {
    /**
     * Test whether a value is NaN (not a number).
     * The function supports types `number`, `BigNumber`, `Fraction`, `Unit` and `Complex`.
     *
     * The function is evaluated element-wise in case of Array or Matrix input.
     *
     * Syntax:
     *
     *     math.isNaN(x)
     *
     * Examples:
     *
     *    math.isNaN(3)                     // returns false
     *    math.isNaN(NaN)                   // returns true
     *    math.isNaN(0)                     // returns false
     *    math.isNaN(math.bignumber(NaN))   // returns true
     *    math.isNaN(math.bignumber(0))     // returns false
     *    math.isNaN(math.fraction(-2, 5))  // returns false
     *    math.isNaN('-2')                  // returns false
     *    math.isNaN([2, 0, -3, NaN])       // returns [false, false, false, true]
     *
     * See also:
     *
     *    isNumeric, isNegative, isPositive, isZero, isInteger, isFinite, isBounded
     *
     * @param {number | BigNumber | bigint | Fraction | Unit | Array | Matrix} x  Value to be tested
     * @return {boolean}  Returns true when `x` is NaN.
     *                    Throws an error in case of an unknown data type.
     */
    return typed(name, {
      number: isNaNNumber,

      BigNumber: function (x: BigNumberType): boolean {
        return x.isNaN()
      },

      bigint: function (_x: bigint): boolean {
        return false
      },

      Fraction: function (_x: unknown): boolean {
        return false
      },

      Complex: function (x: ComplexType): boolean {
        return x.isNaN()
      },

      Unit: function (x: UnitType): boolean {
        return Number.isNaN(x.value)
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self)
      )
    })
  }
)
