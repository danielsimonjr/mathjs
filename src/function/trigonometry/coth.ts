import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { cothNumber } from '../../plain/number/index.ts'

// Type definitions for coth
interface BigNumberConstructor {
  new (value: number): BigNumber
}

interface CothDependencies {
  typed: TypedFunction
  BigNumber: BigNumberConstructor
}

const name = 'coth'
const dependencies = ['typed', 'BigNumber']

export const createCoth = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: CothDependencies) => {
    /**
     * Calculate the hyperbolic cotangent of a value,
     * defined as `coth(x) = 1 / tanh(x)`.
     *
     * To avoid confusion with the matrix hyperbolic cotangent, this function
     * does not apply to matrices.
     *
     * Syntax:
     *
     *    math.coth(x)
     *
     * Examples:
     *
     *    // coth(x) = 1 / tanh(x)
     *    math.coth(2)         // returns 1.0373147207275482
     *    1 / math.tanh(2)     // returns 1.0373147207275482
     *
     * See also:
     *
     *    sinh, tanh, cosh
     *
     * @param {number | BigNumber | Complex} x  Function input
     * @return {number | BigNumber | Complex} Hyperbolic cotangent of x
     */
    return typed(name, {
      number: cothNumber,
      Complex: (x: Complex) => x.coth(),
      BigNumber: (x: BigNumber): BigNumber => new BigNumber(1).div((x as unknown as { tanh(): BigNumber }).tanh())
    }) as TypedFunction
  }
)
