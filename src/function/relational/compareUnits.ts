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
    'Unit, Unit': typed.referToSelf((self: TypedFunction) => (x: unknown, y: unknown): unknown => {
      const unitX = x as UnitType
      const unitY = y as UnitType
      if (!unitX.equalBase(unitY)) {
        throw new Error('Cannot compare units with different base')
      }
      const fn = typed.find(self, [unitX.valueType(), unitY.valueType()])
      return fn ? fn(unitX.value, unitY.value) : undefined
    })
  })
)
