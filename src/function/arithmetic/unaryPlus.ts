import { factory, FactoryFunction } from '../../utils/factory.js'
import { deepMap } from '../../utils/collection.js'
import { unaryPlusNumber } from '../../plain/number/index.js'
import { safeNumberType } from '../../utils/number.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/create.js'

const name = 'unaryPlus'
const dependencies = ['typed', 'config', 'numeric']

export const createUnaryPlus: FactoryFunction<
  { typed: TypedFunction; config: MathJsConfig; numeric: any },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, numeric }) => {
  /**
   * Unary plus operation.
   * Boolean values and strings will be converted to a number, numeric values will be returned as is.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.unaryPlus(x)
   *
   * Examples:
   *
   *    math.unaryPlus(3.5)      // returns 3.5
   *    math.unaryPlus(1)     // returns 1
   *
   * See also:
   *
   *    unaryMinus, add, subtract
   *
   * @param  {number | BigNumber | bigint | Fraction | string | Complex | Unit | Array | Matrix} x
   *            Input value
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix}
   *            Returns the input value when numeric, converts to a number when input is non-numeric.
   */
  return typed(name, {
    number: unaryPlusNumber,

    Complex: function (x: any) {
      return x // complex numbers are immutable
    },

    BigNumber: function (x: any) {
      return x // bignumbers are immutable
    },

    bigint: function (x: bigint): bigint {
      return x
    },

    Fraction: function (x: any) {
      return x // fractions are immutable
    },

    Unit: function (x: any) {
      return x.clone()
    },

    // deep map collection, skip zeros since unaryPlus(0) = 0
    'Array | Matrix': typed.referToSelf((self: any) => (x: any) => deepMap(x, self, true)),

    boolean: function (x: boolean): number {
      return numeric(x ? 1 : 0, config.number)
    },

    string: function (x: string): number {
      return numeric(x, safeNumberType(x, config))
    }
  })
})
