import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import { cosh as coshNumber } from '../../utils/number.ts'

// Type definitions for cosh
interface CoshableType {
  cosh(): CoshableType
}

interface CoshDependencies {
  typed: TypedFunction
}

const name = 'cosh'
const dependencies = ['typed']

export const createCosh = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: CoshDependencies) => {
    /**
     * Calculate the hyperbolic cosine of a value,
     * defined as `cosh(x) = 1/2 * (exp(x) + exp(-x))`.
     *
     * To avoid confusion with the matrix hyperbolic cosine, this function does
     * not apply to matrices.
     *
     * Syntax:
     *
     *    math.cosh(x)
     *
     * Examples:
     *
     *    math.cosh(0.5)       // returns number 1.1276259652063807
     *
     * See also:
     *
     *    sinh, tanh
     *
     * @param {number | BigNumber | Complex} x  Function input
     * @return {number | BigNumber | Complex} Hyperbolic cosine of x
     */
    return typed(name, {
      number: coshNumber,
      'Complex | BigNumber': (x: CoshableType): CoshableType => x.cosh()
    }) as TypedFunction
  }
)
