import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import type { Complex } from '../../type/complex/Complex.js'
import { cscNumber } from '../../plain/number/index.js'
import { createTrigUnit } from './trigUnit.js'

const name = 'csc'
const dependencies = ['typed', 'BigNumber'] as const

export const createCsc: FactoryFunction<'csc', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber }) => {
  const trigUnit = createTrigUnit({ typed })

  /**
   * Calculate the cosecant of a value, defined as `csc(x) = 1/sin(x)`.
   *
   * To avoid confusion with the matrix cosecant, this function does not
   * apply to matrices.
   *
   * Syntax:
   *
   *    math.csc(x)
   *
   * Examples:
   *
   *    math.csc(2)      // returns number 1.099750170294617
   *    1 / math.sin(2)  // returns number 1.099750170294617
   *
   * See also:
   *
   *    sin, sec, cot
   *
   * @param {number | BigNumber | Complex | Unit} x  Function input
   * @return {number | BigNumber | Complex} Cosecant of x
   */
  return typed(name, {
    number: cscNumber,
    Complex: (x: Complex) => x.csc(),
    BigNumber: (x: BigNumber) => new BigNumber(1).div(x.sin())
  }, trigUnit) as TypedFunction
})
