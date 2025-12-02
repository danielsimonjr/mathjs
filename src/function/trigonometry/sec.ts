import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import type { Complex } from '../../type/complex/Complex.js'
import { secNumber } from '../../plain/number/index.js'
import { createTrigUnit } from './trigUnit.js'

const name = 'sec'
<<<<<<< HEAD
const dependencies = ['typed', 'BigNumber']
=======
const dependencies = ['typed', 'BigNumber'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createSec: FactoryFunction<'sec', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber }) => {
  const trigUnit = createTrigUnit({ typed })

  /**
   * Calculate the secant of a value, defined as `sec(x) = 1/cos(x)`.
   *
   * To avoid confusion with the matrix secant, this function does not
   * apply to matrices.
   *
   * Syntax:
   *
   *    math.sec(x)
   *
   * Examples:
   *
   *    math.sec(2)      // returns number -2.4029979617223822
   *    1 / math.cos(2)  // returns number -2.4029979617223822
   *
   * See also:
   *
   *    cos, csc, cot
   *
   * @param {number | BigNumber | Complex | Unit} x  Function input
   * @return {number | BigNumber | Complex} Secant of x
   */
  return typed(name, {
    number: secNumber,
    Complex: (x: Complex) => x.sec(),
    BigNumber: (x: BigNumber) => new BigNumber(1).div(x.cos())
  }, trigUnit) as TypedFunction
})
