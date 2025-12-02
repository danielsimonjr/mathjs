import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import { cosh as coshNumber } from '../../utils/number.js'

const name = 'cosh'
<<<<<<< HEAD
const dependencies = ['typed']
=======
const dependencies = ['typed'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createCosh: FactoryFunction<'cosh', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
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
    'Complex | BigNumber': x => x.cosh()
  }) as TypedFunction
})
