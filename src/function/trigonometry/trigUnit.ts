import { factory } from '../../utils/factory.ts'

import { TypedFunction } from '../../types.ts';

export const createTrigUnit = /* #__PURE__ */ factory(
  'trigUnit', ['typed'], ({
  typed
}: {
  typed: TypedFunction;
}) => ({
    Unit: typed.referToSelf((self: any) => x => {
      if (!x.hasBase(x.constructor.BASE_UNITS.ANGLE)) {
        throw new TypeError('Unit in function cot is no angle')
      }
      return typed.find(self, x.valueType())(x.value)
    })
  })
)
