import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { cscNumber } from '../../plain/number/index.ts'
import { createTrigUnit } from './trigUnit.ts'

// Type definitions for csc
interface BigNumberConstructor {
  new (value: number): BigNumber
}

interface CscDependencies {
  typed: TypedFunction
  BigNumber: BigNumberConstructor
}

const name = 'csc'
const dependencies = ['typed', 'BigNumber']

export const createCsc = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: CscDependencies) => {
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
    return typed(
      name,
      {
        number: cscNumber,
        Complex: (x: Complex) => x.csc(),
        BigNumber: (x: BigNumber): BigNumber =>
          new BigNumber(1).div((x as unknown as { sin(): BigNumber }).sin())
      },
      trigUnit
    ) as TypedFunction
  }
)
