import { factory } from '../../../utils/factory.ts'
import { deepMap } from '../../../utils/collection.ts'
import type { TypedFunction } from '../../../core/function/typed.ts'
import type { MathCollection } from '../../../types.ts'

/**
 * Unit class interface
 */
interface UnitClass {
  new (value: number | null, unit?: string): UnitInstance
  parse(str: string, options?: { allowNoUnits?: boolean }): UnitInstance
  isValuelessUnit(str: string): boolean
}

/**
 * Unit instance interface
 */
interface UnitInstance {
  clone(): UnitInstance
}

/**
 * Dependencies for createUnitFunction
 */
interface UnitFunctionDependencies {
  typed: TypedFunction
  Unit: UnitClass
}

const name = 'unit'
const dependencies = ['typed', 'Unit'] as const

// This function is named createUnitFunction to prevent a naming conflict with createUnit
export const createUnitFunction = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
  ({ typed, Unit }: UnitFunctionDependencies) => {
    /**
     * Create a unit. Depending on the passed arguments, the function
     * will create and return a new math.Unit object.
     * When a matrix is provided, all elements will be converted to units.
     *
     * Syntax:
     *
     *     math.unit(unit : string)
     *     math.unit(value : number, valuelessUnit : Unit)
     *     math.unit(value : number, valuelessUnit : string)
     *
     * Examples:
     *
     *    const kph = math.unit('km/h')   // returns Unit km/h (valueless)
     *    const v = math.unit(25, kph)    // returns Unit 25 km/h
     *    const a = math.unit(5, 'cm')    // returns Unit 50 mm
     *    const b = math.unit('23 kg')    // returns Unit 23 kg
     *    a.to('m')                       // returns Unit 0.05 m
     *
     * See also:
     *
     *    bignumber, boolean, complex, index, matrix, number, string, createUnit
     *
     * @param {* | Array | Matrix} args   A number and unit.
     * @return {Unit | Array | Matrix}    The created unit
     */

    return typed(name, {
      Unit: function (x: UnitInstance): UnitInstance {
        return x.clone()
      },

      string: function (x: string): UnitInstance {
        if (Unit.isValuelessUnit(x)) {
          return new Unit(null, x) // a pure unit
        }

        return Unit.parse(x, { allowNoUnits: true }) // a unit with value, like '5cm'
      },

      'number | BigNumber | Fraction | Complex, string | Unit': function (
        value: number,
        unit: string | UnitInstance
      ): UnitInstance {
        return new Unit(value, unit as string)
      },

      'number | BigNumber | Fraction': function (value: number): UnitInstance {
        // dimensionless
        return new Unit(value)
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (x: MathCollection): MathCollection => deepMap(x as unknown[], self as (item: unknown) => unknown) as unknown as MathCollection
      )
    })
  }
)
