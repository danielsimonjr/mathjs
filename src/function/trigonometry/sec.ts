import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { secNumber } from '../../plain/number/index.ts'
import { createTrigUnit } from './trigUnit.ts'

// Type definitions for sec
interface BigNumberConstructor {
  new (value: number): BigNumber
}

interface SecDependencies {
  typed: TypedFunction
  BigNumber: BigNumberConstructor
}

const name = 'sec'
const dependencies = ['typed', 'BigNumber']

export const createSec = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: SecDependencies) => {
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
    return typed(
      name,
      {
        number: secNumber,
        Complex: (x: Complex) => x.sec(),
        BigNumber: (x: BigNumber): BigNumber =>
          new BigNumber(1).div((x as unknown as { cos(): BigNumber }).cos())
      },
      trigUnit
    ) as TypedFunction
  }
)
