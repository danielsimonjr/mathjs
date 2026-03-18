import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import { acothNumber } from '../../plain/number/index.ts'

// Type definitions for acoth
interface ComplexConstructor {
  new (re: number, im: number): Complex
}

interface BigNumberConstructor {
  new (value: number): BigNumber
}

interface AcothDependencies {
  typed: TypedFunction
  config: ConfigOptions
  Complex: ComplexConstructor
  BigNumber: BigNumberConstructor
}

const name = 'acoth'
const dependencies = ['typed', 'config', 'Complex', 'BigNumber']

export const createAcoth = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, Complex, BigNumber }: AcothDependencies) => {
    /**
     * Calculate the inverse hyperbolic tangent of a value,
     * defined as `acoth(x) = atanh(1/x) = (ln((x+1)/x) + ln(x/(x-1))) / 2`.
     *
     * To avoid confusion with the matrix inverse hyperbolic tangent, this
     * function does not apply to matrices.
     *
     * Syntax:
     *
     *    math.acoth(x)
     *
     * Examples:
     *
     *    math.acoth(0.5)     // returns 0.5493061443340548 - 1.5707963267948966i
     *
     * See also:
     *
     *    acsch, asech
     *
     * @param {number | BigNumber | Complex} x  Function input
     * @return {number | BigNumber | Complex} Hyperbolic arccotangent of x
     */
    return typed(name, {
      number: function (x: number) {
        if (x >= 1 || x <= -1 || config.predictable) {
          return acothNumber(x)
        }
        return new Complex(x, 0).acoth()
      },

      Complex: function (x: Complex) {
        return x.acoth()
      },

      BigNumber: function (x: BigNumber) {
        return new BigNumber(1).div(x).atanh()
      }
    }) as TypedFunction
  }
)
