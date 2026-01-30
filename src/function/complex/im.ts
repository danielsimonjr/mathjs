import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for imaginary part operation
interface BigNumberType {
  mul(x: number): BigNumberType
}

interface FractionType {
  mul(x: number): FractionType
}

interface ComplexType {
  im: number
}

interface Matrix {
  valueOf(): unknown[][]
}

interface ImDependencies {
  typed: TypedFunction
}

const name = 'im'
const dependencies = ['typed']

export const createIm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: ImDependencies) => {
    /**
     * Get the imaginary part of a complex number.
     * For a complex number `a + bi`, the function returns `b`.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.im(x)
     *
     * Examples:
     *
     *    const a = math.complex(2, 3)
     *    math.re(a)                     // returns number 2
     *    math.im(a)                     // returns number 3
     *
     *    math.re(math.complex('-5.2i')) // returns number -5.2
     *    math.re(math.complex(2.4))     // returns number 0
     *
     * See also:
     *
     *    re, conj, abs, arg
     *
     * @param {number | BigNumber | Complex | Array | Matrix} x
     *            A complex number or array with complex numbers
     * @return {number | BigNumber | Array | Matrix} The imaginary part of x
     */
    return typed(name, {
      number: (): number => 0,
      'BigNumber | Fraction': (x: BigNumberType | FractionType): BigNumberType | FractionType => x.mul(0),
      Complex: (x: ComplexType): number => x.im,
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (x: unknown[] | Matrix): unknown[] | Matrix => deepMap(x, self)
      )
    })
  }
)
