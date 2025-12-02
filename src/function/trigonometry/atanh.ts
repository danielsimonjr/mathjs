import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { MathJsConfig } from '../../core/config.js'
import type { Complex } from '../../type/complex/Complex.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import { atanhNumber } from '../../plain/number/index.js'

const name = 'atanh'
<<<<<<< HEAD
const dependencies = ['typed', 'config', 'Complex']
=======
const dependencies = ['typed', 'config', 'Complex'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createAtanh: FactoryFunction<'atanh', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }) => {
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
      if ((x <= 1 && x >= -1) || (config as MathJsConfig).predictable) {
        return atanhNumber(x)
      }
      return new Complex(x, 0).atanh()
    },

    Complex: function (x: Complex) {
      return x.atanh()
    },

    BigNumber: function (x: BigNumber) {
      return x.atanh()
    }
  }) as TypedFunction
})
