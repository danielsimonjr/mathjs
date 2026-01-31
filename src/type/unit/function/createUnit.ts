import { factory } from '../../../utils/factory.ts'
import type { TypedFunction } from '../../../core/function/typed.ts'

/**
 * Unit definition options
 */
interface UnitDefinitionOptions {
  prefixes?: string
  aliases?: string[]
  offset?: number
}

/**
 * Unit definition object
 */
interface UnitDefinition {
  definition?: string
  aliases?: string[]
  prefixes?: string | object
  offset?: number
}

/**
 * Unit instance interface
 */
interface UnitInstance {
  [key: string]: unknown
}

/**
 * Unit class interface with createUnit static method
 */
interface UnitClass {
  createUnit(
    obj: Record<string, string | UnitInstance | UnitDefinition>,
    options: UnitDefinitionOptions
  ): UnitInstance
}

/**
 * Dependencies for createCreateUnit
 */
interface CreateUnitDependencies {
  typed: TypedFunction
  Unit: UnitClass
}

const name = 'createUnit'
const dependencies = ['typed', 'Unit'] as const

export const createCreateUnit = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
  ({ typed, Unit }: CreateUnitDependencies) => {
    /**
     * Create a user-defined unit and register it with the Unit type.
     *
     * Syntax:
     *
     *     math.createUnit({
     *       baseUnit1: {
     *         aliases: [string, ...]
     *         prefixes: object
     *       },
     *       unit2: {
     *         definition: string,
     *         aliases: [string, ...]
     *         prefixes: object,
     *         offset: number
     *       },
     *       unit3: string    // Shortcut
     *     })
     *
     *     // Another shortcut:
     *     math.createUnit(string, unit : string, [object])
     *
     * Examples:
     *
     *     math.createUnit('foo')
     *     math.createUnit('knot', {definition: '0.514444444 m/s', aliases: ['knots', 'kt', 'kts']})
     *     math.createUnit('mph', '1 mile/hour')
     *     math.createUnit('km', math.unit(1000, 'm'))
     *
     * @param {string} name      The name of the new unit. Must be unique. Example: 'knot'
     * @param {string, UnitDefinition, Unit} definition      Definition of the unit in terms of existing units. For example, '0.514444444 m / s'.
     * @param {Object} options   (optional) An object containing any of the following properties:
     *     - `prefixes {string}` "none", "short", "long", "binary_short", or "binary_long". The default is "none".
     *     - `aliases {Array}` Array of strings. Example: ['knots', 'kt', 'kts']
     *     - `offset {Numeric}` An offset to apply when converting from the unit. For example, the offset for celsius is 273.15. Default is 0.
     *
     * See also:
     *
     *     unit
     *
     * @return {Unit} The new unit
     */
    return typed(name, {
      // General function signature. First parameter is an object where each property is the definition of a new unit. The object keys are the unit names and the values are the definitions. The values can be objects, strings, or Units. If a property is an empty object or an empty string, a new base unit is created. The second parameter is the options.
      'Object, Object': function (
        obj: Record<string, string | UnitInstance | UnitDefinition>,
        options: UnitDefinitionOptions
      ): UnitInstance {
        return Unit.createUnit(obj, options)
      },

      // Same as above but without the options.
      Object: function (obj: Record<string, string | UnitInstance | UnitDefinition>): UnitInstance {
        return Unit.createUnit(obj, {})
      },

      // Shortcut method for creating one unit.
      'string, Unit | string | Object, Object': function (
        name: string,
        def: string | UnitInstance | UnitDefinition,
        options: UnitDefinitionOptions
      ): UnitInstance {
        const obj: Record<string, string | UnitInstance | UnitDefinition> = {}
        obj[name] = def
        return Unit.createUnit(obj, options)
      },

      // Same as above but without the options.
      'string, Unit | string | Object': function (name: string, def: string | UnitInstance | UnitDefinition): UnitInstance {
        const obj: Record<string, string | UnitInstance | UnitDefinition> = {}
        obj[name] = def
        return Unit.createUnit(obj, {})
      },

      // Without a definition, creates a base unit.
      string: function (name: string): UnitInstance {
        const obj: Record<string, UnitDefinition> = {}
        obj[name] = {}
        return Unit.createUnit(obj, {})
      }
    })
  }
)
