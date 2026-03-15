import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for combinatorics
interface BigNumberType {
  // BigNumber placeholder for type compatibility
}

type NumericValue = number | BigNumberType

interface CatalanDependencies {
  typed: TypedFunction
  addScalar: (x: NumericValue, y: NumericValue) => NumericValue
  divideScalar: (x: NumericValue, y: NumericValue) => NumericValue
  multiplyScalar: (x: NumericValue, y: NumericValue) => NumericValue
  combinations: (n: NumericValue, k: NumericValue) => NumericValue
  isNegative: (x: NumericValue) => boolean
  isInteger: (x: NumericValue) => boolean
}

const name = 'catalan'
const dependencies = [
  'typed',
  'addScalar',
  'divideScalar',
  'multiplyScalar',
  'combinations',
  'isNegative',
  'isInteger'
]

export const createCatalan = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    addScalar,
    divideScalar,
    multiplyScalar,
    combinations,
    isNegative,
    isInteger
  }: CatalanDependencies) => {
    /**
     * The Catalan Numbers enumerate combinatorial structures of many different types.
     * catalan only takes integer arguments.
     * The following condition must be enforced: n >= 0
     *
     * Syntax:
     *
     *   math.catalan(n)
     *
     * Examples:
     *
     *    math.catalan(3) // returns 5
     *    math.catalan(8) // returns 1430
     *
     * See also:
     *
     *    bellNumbers
     *
     * @param {Number | BigNumber} n    nth Catalan number
     * @return {Number | BigNumber}     Cn(n)
     */
    return typed(name, {
      'number | BigNumber': function (n: NumericValue): NumericValue {
        if (!isInteger(n) || isNegative(n)) {
          throw new TypeError(
            'Non-negative integer value expected in function catalan'
          )
        }

        return divideScalar(
          combinations(multiplyScalar(n, 2), n),
          addScalar(n, 1)
        )
      }
    })
  }
)
