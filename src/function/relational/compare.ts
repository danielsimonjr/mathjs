import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.ts'
import { nearlyEqual } from '../../utils/number.ts'
import { factory } from '../../utils/factory.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatAlgo05xSfSf } from '../../type/matrix/utils/matAlgo05xSfSf.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { createCompareUnits } from './compareUnits.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for compare
interface BigNumberType {
  cmp(n: BigNumberType): number
}

interface BigNumberConstructor {
  new (value: number | string | BigNumberType): BigNumberType
}

interface FractionType {
  compare(n: FractionType): number
}

interface FractionConstructor {
  new (value: number | string | FractionType): FractionType
}

interface MatrixFactory {
  (...args: unknown[]): unknown
}

interface DenseMatrixConstructor {
  new (...args: unknown[]): unknown
}

interface CompareDependencies {
  typed: TypedFunction
  config: ConfigOptions
  matrix: MatrixFactory
  equalScalar: TypedFunction
  BigNumber: BigNumberConstructor
  Fraction: FractionConstructor
  DenseMatrix: DenseMatrixConstructor
  concat: TypedFunction
}

interface CompareNumberDependencies {
  typed: TypedFunction
  config: ConfigOptions
}

const name = 'compare'
const dependencies = [
  'typed',
  'config',
  'matrix',
  'equalScalar',
  'BigNumber',
  'Fraction',
  'DenseMatrix',
  'concat'
]

export const createCompare = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    equalScalar,
    matrix,
    BigNumber,
    Fraction,
    DenseMatrix,
    concat
  }: CompareDependencies) => {
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo05xSfSf = createMatAlgo05xSfSf({ typed, equalScalar })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })
    const compareUnits = createCompareUnits({ typed })

    /**
     * Compare two values. Returns 1 when x > y, -1 when x < y, and 0 when x == y.
     *
     * x and y are considered equal when the relative difference between x and y
     * is smaller than the configured absTol and relTol. The function cannot be used to
     * compare values smaller than approximately 2.22e-16.
     *
     * For matrices, the function is evaluated element wise.
     * Strings are compared by their numerical value.
     *
     * Syntax:
     *
     *    math.compare(x, y)
     *
     * Examples:
     *
     *    math.compare(6, 1)           // returns 1
     *    math.compare(2, 3)           // returns -1
     *    math.compare(7, 7)           // returns 0
     *    math.compare('10', '2')      // returns 1
     *    math.compare('1000', '1e3')  // returns 0
     *
     *    const a = math.unit('5 cm')
     *    const b = math.unit('40 mm')
     *    math.compare(a, b)           // returns 1
     *
     *    math.compare(2, [1, 2, 3])   // returns [1, 0, -1]
     *
     * See also:
     *
     *    equal, unequal, smaller, smallerEq, larger, largerEq, compareNatural, compareText
     *
     * @param  {number | BigNumber | bigint | Fraction | Unit | string | Array | Matrix} x First value to compare
     * @param  {number | BigNumber | bigint | Fraction | Unit | string | Array | Matrix} y Second value to compare
     * @return {number | BigNumber | bigint | Fraction | Array | Matrix} Returns the result of the comparison:
     *                                                          1 when x > y, -1 when x < y, and 0 when x == y.
     */
    return typed(
      name,
      createCompareNumber({ typed, config }),
      {
        'boolean, boolean': function (x: boolean, y: boolean): number {
          return x === y ? 0 : x > y ? 1 : -1
        },

        'BigNumber, BigNumber': function (
          x: BigNumberType,
          y: BigNumberType
        ): BigNumberType {
          return bigNearlyEqual(x, y, config.relTol, config.absTol)
            ? new BigNumber(0)
            : new BigNumber(x.cmp(y))
        },

        'bigint, bigint': function (x: bigint, y: bigint): bigint {
          return x === y ? 0n : x > y ? 1n : -1n
        },

        'Fraction, Fraction': function (
          x: FractionType,
          y: FractionType
        ): FractionType {
          return new Fraction(x.compare(y))
        },

        'Complex, Complex': function (): never {
          throw new TypeError(
            'No ordering relation is defined for complex numbers'
          )
        }
      },
      compareUnits,
      matrixAlgorithmSuite({
        SS: matAlgo05xSfSf,
        DS: matAlgo03xDSf,
        Ss: matAlgo12xSfs
      })
    )
  }
)

export const createCompareNumber = /* #__PURE__ */ factory(
  name,
  ['typed', 'config'],
  ({ typed, config }: CompareNumberDependencies) => {
    return typed(name, {
      'number, number': function (x: number, y: number): number {
        return nearlyEqual(x, y, config.relTol, config.absTol)
          ? 0
          : x > y
            ? 1
            : -1
      }
    })
  }
)
