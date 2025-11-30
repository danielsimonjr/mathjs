import { log10Number } from '../../plain/number/index.js'
import { promoteLogarithm } from '../../utils/bigint.js'
import { deepMap } from '../../utils/collection.js'
import { factory, type FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'

const name = 'log10'
const dependencies = ['typed', 'config', 'Complex']
const log16 = log10Number(16)

export const createLog10: FactoryFunction<typeof name, typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }: { typed: TypedFunction; config: MathJsConfig; Complex: any }): any => {
  /**
   * Calculate the 10-base logarithm of a value. This is the same as calculating `log(x, 10)`.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.log10(x)
   *
   * Examples:
   *
   *    math.log10(0.00001)            // returns -5
   *    math.log10(10000)              // returns 4
   *    math.log(10000) / math.log(10) // returns 4
   *    math.pow(10, 4)                // returns 10000
   *
   * See also:
   *
   *    exp, log, log1p, log2
   *
   * @param {number | BigNumber | Complex | Array | Matrix} x
   *            Value for which to calculate the logarithm.
   * @return {number | BigNumber | Complex | Array | Matrix}
   *            Returns the 10-base logarithm of `x`
   */

  function complexLog (c: any): any {
    return c.log().div(Math.LN10)
  }

  function complexLogNumber (x: any): any {
    return complexLog(new Complex(x, 0))
  }
  return typed(name, {
    number: function (x: any): any {
      if (x >= 0 || config.predictable) {
        return log10Number(x)
      } else {
        // negative value -> complex value computation
        return complexLogNumber(x)
      }
    },

    bigint: promoteLogarithm(log16, log10Number, config, complexLogNumber),

    Complex: complexLog,

    BigNumber: function (x: any): any {
      if (!x.isNegative() || config.predictable) {
        return x.log()
      } else {
        // downgrade to number, return Complex valued result
        return complexLogNumber((x as any).toNumber())
      }
    },

    'Array | Matrix': typed.referToSelf((self: any) => (x: any): any => deepMap(x, self))
  })
})
