import { factory } from '../../utils/factory.js'

export const createTrigUnit = /* #__PURE__ */ factory(
  'trigUnit', ['typed'], ({ typed }: { typed: any }) => ({
    Unit: typed.referToSelf((self: any) => (x: any) => {
      if (!x.hasBase(x.constructor.BASE_UNITS.ANGLE)) {
        throw new TypeError('Unit in function cot is no angle')
      }
      return typed.find(self, x.valueType())(x.value)
    })
  })
)
