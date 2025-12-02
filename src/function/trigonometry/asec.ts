import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'
import type { Complex } from '../../type/complex/Complex.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import { asecNumber } from '../../plain/number/index.js'

const name = 'asec'
<<<<<<< HEAD
const dependencies = ['typed', 'config', 'Complex', 'BigNumber']
=======
const dependencies = ['typed', 'config', 'Complex', 'BigNumber'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createAsec: FactoryFunction<'asec', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex, BigNumber }) => {
  /**
   * Calculate the inverse secant of a value. Defined as `asec(x) = acos(1/x)`.
   *
   * To avoid confusion with the matrix arcsecant, this function does not
   * apply to matrices.
   *
   * Syntax:
   *
   *    math.asec(x)
   *
   * Examples:
   *
   *    math.asec(2)             // returns 1.0471975511965979
   *    math.asec(math.sec(1.5)) // returns 1.5
   *
   *    math.asec(0.5)           // returns Complex 0 + 1.3169578969248166i
   *
   * See also:
   *
   *    acos, acot, acsc
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} The arc secant of x
   */
  return typed(name, {
    number: function (x: number) {
      if (x <= -1 || x >= 1 || (config as MathJsConfig).predictable) {
        return asecNumber(x)
      }
      return new Complex(x, 0).asec()
    },

    Complex: function (x: Complex) {
      return x.asec()
    },

    BigNumber: function (x: BigNumber) {
      return new BigNumber(1).div(x).acos()
    }
  }) as TypedFunction
})
