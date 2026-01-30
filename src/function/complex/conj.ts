import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for complex conjugate operation
interface BigNumberType {
  // BigNumber placeholder
}

interface FractionType {
  // Fraction placeholder
}

interface ComplexType {
  conjugate(): ComplexType
}

interface UnitType {
  constructor: new (value: unknown, format: string) => UnitType
  toNumeric(): number | BigNumberType | ComplexType
  formatUnits(): string
}

interface Matrix {
  valueOf(): unknown[][]
}

interface ConjDependencies {
  typed: TypedFunction
}

const name = 'conj'
const dependencies = ['typed']

export const createConj = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: ConjDependencies) => {
    /**
     * Compute the complex conjugate of a complex value.
     * If `x = a+bi`, the complex conjugate of `x` is `a - bi`.
     *
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.conj(x)
     *
     * Examples:
     *
     *    math.conj(math.complex('2 + 3i'))  // returns Complex 2 - 3i
     *    math.conj(math.complex('2 - 3i'))  // returns Complex 2 + 3i
     *    math.conj(math.complex('-5.2i'))  // returns Complex 5.2i
     *
     * See also:
     *
     *    re, im, arg, abs
     *
     * @param {number | BigNumber | Complex | Array | Matrix | Unit} x
     *            A complex number or array with complex numbers
     * @return {number | BigNumber | Complex | Array | Matrix | Unit}
     *            The complex conjugate of x
     */
    return typed(name, {
      'number | BigNumber | Fraction': (x: number | BigNumberType | FractionType): number | BigNumberType | FractionType => x,
      Complex: (x: ComplexType): ComplexType => x.conjugate(),
      Unit: typed.referToSelf(
        (self: TypedFunction) => (x: UnitType): UnitType =>
          new x.constructor(self(x.toNumeric()), x.formatUnits())
      ),
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) => (x: unknown[] | Matrix): unknown[] | Matrix => deepMap(x, self)
      )
    })
  }
)
