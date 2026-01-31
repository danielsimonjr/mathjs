import { factory } from '../../utils/factory.ts'
import type { TypedFunction as TypedFn } from '../../types.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for trigUnit
interface UnitType {
  hasBase(base: unknown): boolean
  constructor: { BASE_UNITS: { ANGLE: unknown } }
  valueType(): string
  value: unknown
}

interface TrigUnitDependencies {
  typed: TypedFunction
}

export const createTrigUnit = /* #__PURE__ */ factory(
  'trigUnit',
  ['typed'],
  ({ typed }: TrigUnitDependencies) => ({
    Unit: typed.referToSelf((self: TypedFunction) => (...args: unknown[]): unknown => {
      const x = args[0] as UnitType
      if (!x.hasBase(x.constructor.BASE_UNITS.ANGLE)) {
        throw new TypeError('Unit in function cot is no angle')
      }
      return typed.find(self, x.valueType())(x.value)
    })
  })
)
