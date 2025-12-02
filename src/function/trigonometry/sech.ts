import { factory } from '../../utils/factory.js'
import { sechNumber } from '../../plain/number/index.js'

const name = 'sech'
const dependencies = ['typed', 'BigNumber'] as const

export const createSech = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber }: { typed: any; BigNumber: any }) => {
  /**
   * Calculate the hyperbolic secant of a value,
   * defined as `sech(x) = 1 / cosh(x)`.
   *
   * To avoid confusion with the matrix hyperbolic secant, this function does
   * not apply to matrices.
   *
   * Syntax:
   *
   *    math.sech(x)
   *
   * Examples:
   *
   *    // sech(x) = 1/ cosh(x)
   *    math.sech(0.5)       // returns 0.886818883970074
   *    1 / math.cosh(0.5)   // returns 0.886818883970074
   *
   * See also:
   *
   *    cosh, csch, coth
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic secant of x
   */
  return typed(name, {
    number: sechNumber,
    Complex: (x: any) => x.sech(),
    BigNumber: (x: any) => new BigNumber(1).div(x.cosh())
  })
})
