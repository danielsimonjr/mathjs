import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { MathJsConfig } from '../../core/config.ts'
import { deepMap } from '../../utils/collection.ts'
import { log1p as _log1p } from '../../utils/number.ts'

// Type definitions for log1p
interface ComplexType {
  re: number
  im: number
}

interface ComplexConstructor {
  new (re: number, im: number): ComplexType
}

interface BigNumberType {
  plus(n: number): BigNumberType
  isNegative(): boolean
  ln(): BigNumberType
  toNumber(): number
}

interface Log1pDependencies {
  typed: TypedFunction
  config: MathJsConfig
  divideScalar: TypedFunction
  log: TypedFunction
  Complex: ComplexConstructor
}

const name = 'log1p'
const dependencies = ['typed', 'config', 'divideScalar', 'log', 'Complex']

export const createLog1p = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    divideScalar,
    log,
    Complex
  }: Log1pDependencies) => {
    /**
     * Calculate the logarithm of a `value+1`.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.log1p(x)
     *    math.log1p(x, base)
     *
     * Examples:
     *
     *    math.log1p(2.5)                 // returns 1.252762968495368
     *    math.exp(math.log1p(1.4))       // returns 2.4
     *
     *    math.pow(10, 4)                 // returns 10000
     *    math.log1p(9999, 10)            // returns 4
     *    math.log1p(9999) / math.log(10) // returns 4
     *
     * See also:
     *
     *    exp, log, log2, log10
     *
     * @param {number | BigNumber | Complex | Array | Matrix} x
     *            Value for which to calculate the logarithm of `x+1`.
     * @param {number | BigNumber | Complex} [base=e]
     *            Optional base for the logarithm. If not provided, the natural
     *            logarithm of `x+1` is calculated.
     * @return {number | BigNumber | Complex | Array | Matrix}
     *            Returns the logarithm of `x+1`
     */
    return typed(name, {
      number: function (x: number): number | ComplexType {
        if (x >= -1 || config.predictable) {
          return _log1p(x)
        } else {
          // negative value -> complex value computation
          return _log1pComplex(new Complex(x, 0))
        }
      },

      Complex: _log1pComplex,

      BigNumber: function (x: BigNumberType): BigNumberType | ComplexType {
        const y = x.plus(1)
        if (!y.isNegative() || config.predictable) {
          return y.ln()
        } else {
          // downgrade to number, return Complex valued result
          return _log1pComplex(new Complex(x.toNumber(), 0))
        }
      },

      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self)
      ),

      'any, any': typed.referToSelf((self: TypedFunction) => (x: unknown, base: unknown): unknown => {
        // calculate logarithm for a specified base, log1p(x, base)
        return divideScalar(self(x), log(base))
      })
    })

    /**
     * Calculate the natural logarithm of a complex number + 1
     * @param {Complex} x
     * @returns {Complex}
     * @private
     */
    function _log1pComplex(x: ComplexType): ComplexType {
      const xRe1p = x.re + 1
      return new Complex(
        Math.log(Math.sqrt(xRe1p * xRe1p + x.im * x.im)),
        Math.atan2(x.im, xRe1p)
      )
    }
  }
)
