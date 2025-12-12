import { factory } from '../../utils/factory.ts'

import { TypedFunction } from '../../types.ts';

export const createCompareUnits = /* #__PURE__ */ factory(
  'compareUnits', ['typed'], ({
  typed
}: {
  typed: TypedFunction;
}) => ({
    'Unit, Unit': typed.referToSelf((self: any) => (x, y) => {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base')
      }
      return typed.find(self, [x.valueType(), y.valueType()])(x.value, y.value)
    })
  })
)
