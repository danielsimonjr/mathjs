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

// Type definitions for smallerEq
interface BigNumberType {
  lte(n: BigNumberType): boolean
}

interface FractionType {
  compare(n: FractionType): number
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

interface SmallerEqDependencies {
  typed: TypedFunction
  config: ConfigOptions
  matrix: MatrixFactory
  DenseMatrix: DenseMatrixConstructor
  concat: TypedFunction
  SparseMatrix: SparseMatrixConstructor
}

interface SmallerEqNumberDependencies {
  typed: TypedFunction
  config: ConfigOptions
}

const name = 'smallerEq'
const dependencies = [
  'typed',
  'config',
  'matrix',
  'DenseMatrix',
  'concat',
  'SparseMatrix'
]

export const createSmallerEq = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    matrix,
    DenseMatrix,
    concat,
    SparseMatrix
  }: SmallerEqDependencies) => {
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
     * Test whether value x is smaller or equal to y.
     *
     * The function returns true when x is smaller than y or the relative
     * difference between x and y is smaller than the configured relTol and absTol. The
     * function cannot be used to compare values smaller than approximately 2.22e-16.
     *
     * For matrices, the function is evaluated element wise.
     * Strings are compared by their numerical value.
     *
     * Syntax:
     *
     *    math.smallerEq(x, y)
     *
     * Examples:
     *
     *    math.smaller(1 + 2, 3)        // returns false
     *    math.smallerEq(1 + 2, 3)      // returns true
     *
     * See also:
     *
     *    equal, unequal, smaller, larger, largerEq, compare
     *
     * @param  {number | BigNumber | bigint | Fraction | boolean | Unit | string | Array | Matrix} x First value to compare
     * @param  {number | BigNumber | bigint | Fraction | boolean | Unit | string | Array | Matrix} y Second value to compare
     * @return {boolean | Array | Matrix} Returns true when the x is smaller than y, else returns false
     */
    return typed(
      name,
      createSmallerEqNumber({ typed, config }),
      {
        'boolean, boolean': (x: boolean, y: boolean): boolean => x <= y,

        'BigNumber, BigNumber': function (
          x: BigNumberType,
          y: BigNumberType
        ): boolean {
          return x.lte(y) || bigNearlyEqual(x, y, config.relTol, config.absTol)
        },

        'bigint, bigint': (x: bigint, y: bigint): boolean => x <= y,

        'Fraction, Fraction': (x: FractionType, y: FractionType): boolean =>
          x.compare(y) !== 1,

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

export const createSmallerEqNumber = /* #__PURE__ */ factory(
  name,
  ['typed', 'config'],
  ({ typed, config }: SmallerEqNumberDependencies) => {
    return typed(name, {
      'number, number': function (x: number, y: number): boolean {
        return x <= y || nearlyEqual(x, y, config.relTol, config.absTol)
      }
    })
  }
)
