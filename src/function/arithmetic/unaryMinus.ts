import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import { unaryMinusNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

const name = 'unaryMinus'
const dependencies = ['typed']

export const createUnaryMinus = /* #__PURE__ */ factory(name, dependencies, ({ typed }: { typed: any }) => {
  /**
   * Inverse the sign of a value, apply a unary minus operation.
   *
   * For matrices, the function is evaluated element wise. Boolean values and
   * strings will be converted to a number. For complex numbers, both real and
   * complex value are inverted.
   *
   * Syntax:
   *
   *    math.unaryMinus(x)
   *
   * Examples:
   *
   *    math.unaryMinus(3.5)      // returns -3.5
   *    math.unaryMinus(-4.2)     // returns 4.2
   *
   * See also:
   *
   *    add, subtract, unaryPlus
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x Number to be inverted.
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} Returns the value with inverted sign.
   */
  return typed(name, {
    number: unaryMinusNumber,

    'Complex | BigNumber | Fraction': (x: any) => x.neg(),

    bigint: (x: bigint): bigint => -x,

    Unit: typed.referToSelf((self: any) => (x: any) => {
      const res = x.clone()
      res.value = typed.find(self, res.valueType())(x.value)
      return res
    }),

    // deep map collection, skip zeros since unaryMinus(0) = 0
    'Array | Matrix': typed.referToSelf((self: any) => (x: any) => deepMap(x, self, true))

    // TODO: add support for string
  })
})
