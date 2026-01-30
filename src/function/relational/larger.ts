import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual.ts'
import { nearlyEqual } from '../../utils/number.ts'
import { factory } from '../../utils/factory.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo07xSSf } from '../../type/matrix/utils/matAlgo07xSSf.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { createCompareUnits } from './compareUnits.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for larger
interface BigNumberType {
  gt(n: BigNumberType): boolean
}

interface FractionType {
  compare(n: FractionType): number
}

interface BigNumberFactory {
  (value: unknown): BigNumberType
}

interface MatrixFactory {
  (...args: unknown[]): unknown
}

interface DenseMatrixConstructor {
  new (...args: unknown[]): unknown
}

interface SparseMatrixConstructor {
  new (...args: unknown[]): unknown
}

interface LargerDependencies {
  typed: TypedFunction
  config: ConfigOptions
  bignumber: BigNumberFactory
  matrix: MatrixFactory
  DenseMatrix: DenseMatrixConstructor
  concat: TypedFunction
  SparseMatrix: SparseMatrixConstructor
}

interface LargerNumberDependencies {
  typed: TypedFunction
  config: ConfigOptions
}

const name = 'larger'
const dependencies = [
  'typed',
  'config',
  'bignumber',
  'matrix',
  'DenseMatrix',
  'concat',
  'SparseMatrix'
]

export const createLarger = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    bignumber,
    matrix,
    DenseMatrix,
    concat,
    SparseMatrix
  }: LargerDependencies) => {
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo07xSSf = createMatAlgo07xSSf({ typed, SparseMatrix })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })
    const compareUnits = createCompareUnits({ typed })

    /**
     * Test whether value x is larger than y.
     *
     * The function returns true when x is larger than y and the relative
     * difference between x and y is larger than the configured relTol and absTol. The
     * function cannot be used to compare values smaller than approximately 2.22e-16.
     *
     * For matrices, the function is evaluated element wise.
     * Strings are compared by their numerical value.
     *
     * Syntax:
     *
     *    math.larger(x, y)
     *
     * Examples:
     *
     *    math.larger(2, 3)             // returns false
     *    math.larger(5, 2 + 2)         // returns true
     *
     *    const a = math.unit('5 cm')
     *    const b = math.unit('2 inch')
     *    math.larger(a, b)             // returns false
     *
     * See also:
     *
     *    equal, unequal, smaller, smallerEq, largerEq, compare
     *
     * @param  {number | BigNumber | bigint | Fraction | boolean | Unit | string | Array | Matrix} x First value to compare
     * @param  {number | BigNumber | bigint | Fraction | boolean | Unit | string | Array | Matrix} y Second value to compare
     * @return {boolean | Array | Matrix} Returns true when the x is larger than y, else returns false
     */
    function bignumLarger(x: BigNumberType, y: BigNumberType): boolean {
      return x.gt(y) && !bigNearlyEqual(x, y, config.relTol, config.absTol)
    }

    return typed(
      name,
      createLargerNumber({ typed, config }),
      {
        'boolean, boolean': (x: boolean, y: boolean): boolean => x > y,

        'BigNumber, BigNumber': bignumLarger,

        'bigint, bigint': (x: bigint, y: bigint): boolean => x > y,

        'Fraction, Fraction': (x: FractionType, y: FractionType): boolean => x.compare(y) === 1,

        'Fraction, BigNumber': function (x: FractionType, y: BigNumberType): boolean {
          return bignumLarger(bignumber(x), y)
        },

        'BigNumber, Fraction': function (x: BigNumberType, y: FractionType): boolean {
          return bignumLarger(x, bignumber(y))
        },

        'Complex, Complex': function (): never {
          throw new TypeError(
            'No ordering relation is defined for complex numbers'
          )
        }
      },
      compareUnits,
      matrixAlgorithmSuite({
        SS: matAlgo07xSSf,
        DS: matAlgo03xDSf,
        Ss: matAlgo12xSfs
      })
    )
  }
)

export const createLargerNumber = /* #__PURE__ */ factory(
  name,
  ['typed', 'config'],
  ({ typed, config }: LargerNumberDependencies) => {
    return typed(name, {
      'number, number': function (x: number, y: number): boolean {
        return x > y && !nearlyEqual(x, y, config.relTol, config.absTol)
      }
    })
  }
)
