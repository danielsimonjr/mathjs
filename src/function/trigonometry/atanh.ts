import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { MathJsConfig } from '../../core/config.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import { atanhNumber } from '../../plain/number/index.ts'

const name = 'atanh'
const dependencies = ['typed', 'config', 'Complex']

export const createAtanh = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }: {
  typed: TypedFunction
  config: MathJsConfig
  Complex: any
}) => {
  /**
   * Calculate the hyperbolic arctangent of a value,
   * defined as `atanh(x) = ln((1 + x)/(1 - x)) / 2`.
   *
   * To avoid confusion with the matrix hyperbolic arctangent, this function
   * does not apply to matrices.
   *
   * Syntax:
   *
   *    math.atanh(x)
   *
   * Examples:
   *
   *    math.atanh(0.5)       // returns 0.5493061443340549
   *
   * See also:
   *
   *    acosh, asinh
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic arctangent of x
   */
  return typed(name, {
    number: function (x: number) {
      if ((x <= 1 && x >= -1) || config.predictable) {
        return atanhNumber(x)
      }
      return new Complex(x, 0).atanh()
    },

    Complex: function (x: Complex) {
      return x.atanh()
    },

    BigNumber: function (x: BigNumber) {
      return (x as any).atanh()
    }
  }) as TypedFunction
})
