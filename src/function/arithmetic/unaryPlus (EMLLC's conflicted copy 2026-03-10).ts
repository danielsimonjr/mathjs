import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import { unaryPlusNumber } from '../../plain/number/index.ts'
import { safeNumberType } from '../../utils/number.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for unaryPlus
interface HasCloneMethod {
  clone(): unknown
}

interface UnaryPlusDependencies {
  typed: TypedFunction
  config: ConfigOptions
  numeric: (value: number | string, type: string) => unknown
}

const name = 'unaryPlus'
const dependencies = ['typed', 'config', 'numeric']

export const createUnaryPlus = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, numeric }: UnaryPlusDependencies) => {
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

      Complex: function <T>(x: T): T {
        return x // complex numbers are immutable
      },

      BigNumber: function <T>(x: T): T {
        return x // bignumbers are immutable
      },

      bigint: function (x: bigint): bigint {
        return x
      },

      Fraction: function <T>(x: T): T {
        return x // fractions are immutable
      },

      Unit: function (x: HasCloneMethod): unknown {
        return x.clone()
      },

      // deep map collection, skip zeros since unaryPlus(0) = 0
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self, true)
      ),

      boolean: function (x: boolean): unknown {
        return numeric(x ? 1 : 0, config.number)
      },

      string: function (x: string): unknown {
        return numeric(x, safeNumberType(x, config))
      }
    })
  }
)
