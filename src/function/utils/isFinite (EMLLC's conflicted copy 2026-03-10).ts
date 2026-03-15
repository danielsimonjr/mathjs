import { factory } from '../../utils/factory.ts'
import type { TypedFunction as TypedFn, Matrix } from '../../types.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for isFinite
interface IsFiniteDependencies {
  typed: TypedFunction
  isBounded: (x: unknown) => boolean
  map: (
    arr: unknown[] | Matrix,
    fn: (x: unknown) => boolean
  ) => unknown[] | Matrix
}

const name = 'isFinite'
const dependencies = ['typed', 'isBounded', 'map']

export const createIsFinite = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, isBounded, map }: IsFiniteDependencies): TypedFn => {
    /**
     * Test whether a value is finite.
     *
     * Operates elementwise on Array and Matrix values. To test if all entries
     * of an Array or Matrix are finite, use isBounded.
     *
     * Syntax:
     *
     *     math.isFinite(x)
     *
     * Examples:
     *
     *    math.isFinite(0)                        // returns true
     *    math.isFinite(NaN)                      // returns false
     *    math.isFinite(math.bignumber(Infinity)) // returns false
     *    math.isFinite(math.fraction(1,3))       // returns true
     *    math.isFinite(math.complex('2 - 4i'))   // returns true
     *    math.isFinite(-10000000000000000n)      // returns true
     *    math.isFinite(undefined)                // returns false
     *    math.isFinite(null)                     // returns false
     *    math.isFinite([0.001, -3n, 0])          // Array [true, true, true]
     *    math.isFinite([2, -Infinity, -3])       // Array [true, false, true]
     *
     * See also:
     *
     *    isBounded isNumeric, isPositive, isNegative, isNaN
     *
     * @param {number | BigNumber | bigint | Complex | Fraction | Unit | Array | Matrix} x       Value to be tested
     * @return {boolean | Array | Matrix}
     */
    return typed(name, {
      'Array | Matrix': (A: unknown[] | Matrix): unknown[] | Matrix =>
        map(A, isBounded),
      any: (x: unknown): boolean => isBounded(x)
    })
  }
)
