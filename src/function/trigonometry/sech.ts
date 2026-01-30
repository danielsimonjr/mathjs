import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { sechNumber } from '../../plain/number/index.ts'

// Type definitions for sech
interface BigNumberConstructor {
  new (value: number): BigNumber
}

interface SechDependencies {
  typed: TypedFunction
  BigNumber: BigNumberConstructor
}

const name = 'sech'
const dependencies = ['typed', 'BigNumber']

export const createSech = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: SechDependencies) => {
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
      Complex: (x: Complex) => x.sech(),
      BigNumber: (x: BigNumber): BigNumber => new BigNumber(1).div((x as unknown as { cosh(): BigNumber }).cosh())
    }) as TypedFunction
  }
)
