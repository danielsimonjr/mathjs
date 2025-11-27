import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'
import type { Complex } from '../../type/complex/Complex.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import { acoshNumber } from '../../plain/number/index.js'

const name = 'acosh'
const dependencies = ['typed', 'config', 'Complex'] as const

export const createAcosh: FactoryFunction<'acosh', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }) => {
  /**
   * Calculate the hyperbolic arccos of a value,
   * defined as `acosh(x) = ln(sqrt(x^2 - 1) + x)`.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.acosh(x)
   *
   * Examples:
   *
   *    math.acosh(1.5)       // returns 0.9624236501192069
   *
   * See also:
   *
   *    cosh, asinh, atanh
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic arccosine of x
   */
  return typed(name, {
    number: function (x: number) {
      if (x >= 1 || (config as MathJsConfig).predictable) {
        return acoshNumber(x)
      }
      if (x <= -1) {
        return new Complex(Math.log(Math.sqrt(x * x - 1) - x), Math.PI)
      }
      return new Complex(x, 0).acosh()
    },

    Complex: function (x: Complex) {
      return x.acosh()
    },

    BigNumber: function (x: BigNumber) {
      return x.acosh()
    }
  }) as TypedFunction
})
