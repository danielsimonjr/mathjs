import { factory } from '../../utils/factory.js'

export const createCompareUnits = /* #__PURE__ */ factory(
  'compareUnits', ['typed'], ({ typed }: { typed: any }) => ({
    'Unit, Unit': typed.referToSelf((self: any) => (x: any, y: any) => {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base')
      }
      return typed.find(self, [x.valueType(), y.valueType()])(x.value, y.value)
    })
  })
)
