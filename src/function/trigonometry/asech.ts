import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'
import type { Complex } from '../../type/complex/Complex.js'
import type { BigNumber } from '../../type/bignumber/BigNumber.js'
import { asechNumber } from '../../plain/number/index.js'

const name = 'asech'
const dependencies = ['typed', 'config', 'Complex', 'BigNumber']

export const createAsech: FactoryFunction<'asech', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex, BigNumber }) => {
  /**
   * Calculate the hyperbolic arcsecant of a value,
   * defined as `asech(x) = acosh(1/x) = ln(sqrt(1/x^2 - 1) + 1/x)`.
   *
   * To avoid confusion with the matrix hyperbolic arcsecant, this function
   * does not apply to matrices.
   *
   * Syntax:
   *
   *    math.asech(x)
   *
   * Examples:
   *
   *    math.asech(0.5)       // returns 1.3169578969248166
   *
   * See also:
   *
   *    acsch, acoth
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic arcsecant of x
   */
  return typed(name, {
    number: function (x: number) {
      if ((x <= 1 && x >= -1) || (config as MathJsConfig).predictable) {
        const xInv = 1 / x
        if (xInv > 0 || (config as MathJsConfig).predictable) {
          return asechNumber(x)
        }

        const ret = Math.sqrt(xInv * xInv - 1)
        return new Complex(Math.log(ret - xInv), Math.PI)
      }

      return new Complex(x, 0).asech()
    },

    Complex: function (x: Complex) {
      return x.asech()
    },

    BigNumber: function (x: BigNumber) {
      return new BigNumber(1).div(x).acosh()
    }
  }) as TypedFunction
})
