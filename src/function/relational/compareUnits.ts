import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for compareUnits
interface UnitType {
  equalBase(other: UnitType): boolean
  valueType(): string
  value: unknown
}

interface CompareUnitsDependencies {
  typed: TypedFunction
}

export const createCompareUnits = /* #__PURE__ */ factory(
  'compareUnits',
  ['typed'],
  ({ typed }: CompareUnitsDependencies) => ({
    'Unit, Unit': typed.referToSelf((self: TypedFunction) => (x: UnitType, y: UnitType): unknown => {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base')
      }
      return typed.find(self, [x.valueType(), y.valueType()])(x.value, y.value)
    })
  })
)
