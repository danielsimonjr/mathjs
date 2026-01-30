import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for real part operation
interface BigNumberType {
  // BigNumber placeholder
}

interface FractionType {
  // Fraction placeholder
}

interface ComplexType {
  re: number
}

interface Matrix {
  valueOf(): unknown[][]
}

interface ReDependencies {
  typed: TypedFunction
}

const name = 're'
const dependencies = ['typed']

export const createRe = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: ReDependencies) => {
    /**
     * Get the real part of a complex number.
     * For a complex number `a + bi`, the function returns `a`.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.re(x)
     *
     * Examples:
     *
     *    const a = math.complex(2, 3)
     *    math.re(a)                     // returns number 2
     *    math.im(a)                     // returns number 3
     *
     *    math.re(math.complex('-5.2i')) // returns number 0
     *    math.re(math.complex(2.4))     // returns number 2.4
     *
     * See also:
     *
     *    im, conj, abs, arg
     *
     * @param {number | BigNumber | Complex | Array | Matrix} x
     *            A complex number or array with complex numbers
     * @return {number | BigNumber | Array | Matrix} The real part of x
     */
    return typed(name, {
      'number | BigNumber | Fraction': (x: number | BigNumberType | FractionType): number | BigNumberType | FractionType => x,
      Complex: (x: ComplexType): number => x.re,
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (x: unknown[] | Matrix): unknown[] | Matrix => deepMap(x, self)
      )
    })
  }
)
