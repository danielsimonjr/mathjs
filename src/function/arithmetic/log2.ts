import { log2Number } from '../../plain/number/index.ts'
import { promoteLogarithm } from '../../utils/bigint.ts'
import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { MathJsConfig } from '../../core/config.ts'

// Type definitions for log2
interface ComplexType {
  re: number
  im: number
}

interface ComplexConstructor {
  new (re: number, im: number): ComplexType
}

interface BigNumberType {
  isNegative(): boolean
  log(base: number): BigNumberType
  toNumber(): number
}

interface Log2Dependencies {
  typed: TypedFunction
  config: MathJsConfig
  Complex: ComplexConstructor
}

const name = 'log2'
const dependencies = ['typed', 'config', 'Complex']

export const createLog2 = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    Complex
  }: Log2Dependencies) => {
    /**
     * Calculate the 2-base of a value. This is the same as calculating `log(x, 2)`.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.log2(x)
     *
     * Examples:
     *
     *    math.log2(0.03125)           // returns -5
     *    math.log2(16)                // returns 4
     *    math.log2(16) / math.log2(2) // returns 4
     *    math.pow(2, 4)               // returns 16
     *
     * See also:
     *
     *    exp, log, log1p, log10
     *
     * @param {number | BigNumber | Complex | Array | Matrix} x
     *            Value for which to calculate the logarithm.
     * @return {number | BigNumber | Complex | Array | Matrix}
     *            Returns the 2-base logarithm of `x`
     */
    function complexLog2Number(x: number): ComplexType {
      return _log2Complex(new Complex(x, 0))
    }

    return typed(name, {
      number: function (x: number): number | ComplexType {
        if (x >= 0 || config.predictable) {
          return log2Number(x)
        } else {
          // negative value -> complex value computation
          return complexLog2Number(x)
        }
      },

      bigint: promoteLogarithm(4, log2Number, config, complexLog2Number),

      Complex: _log2Complex,

      BigNumber: function (x: BigNumberType): BigNumberType | ComplexType {
        if (!x.isNegative() || config.predictable) {
          return x.log(2)
        } else {
          // downgrade to number, return Complex valued result
          return complexLog2Number(x.toNumber())
        }
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self)
      )
    })

    /**
     * Calculate log2 for a complex value
     * @param {Complex} x
     * @returns {Complex}
     * @private
     */
    function _log2Complex(x: ComplexType): ComplexType {
      const newX = Math.sqrt(x.re * x.re + x.im * x.im)
      return new Complex(
        Math.log2 ? Math.log2(newX) : Math.log(newX) / Math.LN2,
        Math.atan2(x.im, x.re) / Math.LN2
      )
    }
  }
)
