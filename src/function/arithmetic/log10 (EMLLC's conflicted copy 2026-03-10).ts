import { log10Number } from '../../plain/number/index.ts'
import { promoteLogarithm } from '../../utils/bigint.ts'
import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { MathJsConfig } from '../../core/config.ts'

// Type definitions for log10
interface ComplexType {
  log(): { div(n: number): ComplexType }
}

interface ComplexConstructor {
  new (re: number, im: number): ComplexType
}

interface BigNumberType {
  isNegative(): boolean
  log(): BigNumberType
  toNumber(): number
}

interface Log10Dependencies {
  typed: TypedFunction
  config: MathJsConfig
  Complex: ComplexConstructor
}

const name = 'log10'
const dependencies = ['typed', 'config', 'Complex']
const log16 = log10Number(16)

export const createLog10 = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, Complex }: Log10Dependencies) => {
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

    function complexLog(c: ComplexType): ComplexType {
      return c.log().div(Math.LN10)
    }

    function complexLogNumber(x: number): ComplexType {
      return complexLog(new Complex(x, 0))
    }
    return typed(name, {
      number: function (x: number): number | ComplexType {
        if (x >= 0 || config.predictable) {
          return log10Number(x)
        } else {
          // negative value -> complex value computation
          return complexLogNumber(x)
        }
      },

      bigint: promoteLogarithm(log16, log10Number, config, complexLogNumber),

      Complex: complexLog,

      BigNumber: function (x: BigNumberType): BigNumberType | ComplexType {
        if (!x.isNegative() || config.predictable) {
          return x.log()
        } else {
          // downgrade to number, return Complex valued result
          return complexLogNumber(x.toNumber())
        }
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self)
      )
    })
  }
)
