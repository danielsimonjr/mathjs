import { factory } from '../../../utils/factory.ts'
import type { TypedFunction } from '../../../core/function/typed.ts'

/**
 * Unit instance interface with splitUnit method
 */
interface UnitInstance {
  splitUnit(parts: Array<string | UnitInstance>): UnitInstance[]
}

/**
 * Dependencies for createSplitUnit
 */
interface SplitUnitDependencies {
  typed: TypedFunction
}

const name = 'splitUnit'
const dependencies = ['typed'] as const

export const createSplitUnit = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
  ({ typed }: SplitUnitDependencies) => {
    /**
     * Split a unit in an array of units whose sum is equal to the original unit.
     *
     * Syntax:
     *
     *     math.splitUnit(unit: Unit, parts: Array.<Unit>)
     *
     * Example:
     *
     *     math.splitUnit(new Unit(1, 'm'), ['feet', 'inch'])
     *     // [ 3 feet, 3.3700787401575 inch ]
     *
     * See also:
     *
     *     unit
     *
     * @param {Array} [parts] An array of strings or valueless units.
     * @return {Array} An array of units.
     */
    return typed(name, {
      'Unit, Array': function (unit: UnitInstance, parts: Array<string | UnitInstance>): UnitInstance[] {
        return unit.splitUnit(parts)
      }
    })
  }
)
