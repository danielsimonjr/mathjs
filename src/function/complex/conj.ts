import { factory, FactoryFunction } from '../../utils/factory.js'
import { deepMap } from '../../utils/collection.js'

const name = 'conj'
const dependencies = ['typed'] as const

export const createConj: FactoryFunction<'typed', typeof name> = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
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
    'number | BigNumber | Fraction': (x: any) => x,
    Complex: (x: any) => x.conjugate(),
    Unit: typed.referToSelf((self: Function) => (x: any) => new x.constructor(self(x.toNumeric()), x.formatUnits())),
    'Array | Matrix': typed.referToSelf((self: Function) => (x: any) => deepMap(x, self))
  })
})
