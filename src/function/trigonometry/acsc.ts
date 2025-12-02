import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'
import type { Complex } from '../../type/complex/Complex.js'
import type { BigNumber } from '../../type/bignumber/BigNumber.js'
import { acscNumber } from '../../plain/number/index.js'

const name = 'acsc'
const dependencies = ['typed', 'config', 'Complex', 'BigNumber']

export const createAcsc: FactoryFunction<'acsc', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex, BigNumber }) => {
  /**
   * Calculate the inverse cosecant of a value, defined as `acsc(x) = asin(1/x)`.
   *
   * To avoid confusion with the matrix arccosecant, this function does not
   * apply to matrices.
   *
   * Syntax:
   *
   *    math.acsc(x)
   *
   * Examples:
   *
   *    math.acsc(2)             // returns 0.5235987755982989
   *    math.acsc(0.5)           // returns Complex 1.5707963267948966 -1.3169578969248166i
   *    math.acsc(math.csc(1.5)) // returns number 1.5
   *
   * See also:
   *
   *    csc, asin, asec
   *
   * @param {number | BigNumber | Complex} x   Function input
   * @return {number | BigNumber | Complex} The arc cosecant of x
   */
  return typed(name, {
    number: function (x: number) {
      if (x <= -1 || x >= 1 || (config as MathJsConfig).predictable) {
        return acscNumber(x)
      }
      return new Complex(x, 0).acsc()
    },

    Complex: function (x: Complex) {
      return x.acsc()
    },

    BigNumber: function (x: BigNumber) {
      return new BigNumber(1).div(x).asin()
    }
  }) as TypedFunction
})
