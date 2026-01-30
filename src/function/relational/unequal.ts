import { factory } from '../../utils/factory.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo07xSSf } from '../../type/matrix/utils/matAlgo07xSSf.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for unequal
interface MatrixFactory {
  (...args: unknown[]): unknown
}

interface DenseMatrixConstructor {
  new (...args: unknown[]): unknown
}

interface SparseMatrixConstructor {
  new (...args: unknown[]): unknown
}

interface UnequalDependencies {
  typed: TypedFunction
  config: ConfigOptions
  equalScalar: TypedFunction
  matrix: MatrixFactory
  DenseMatrix: DenseMatrixConstructor
  concat: TypedFunction
  SparseMatrix: SparseMatrixConstructor
}

interface UnequalNumberDependencies {
  typed: TypedFunction
  equalScalar: TypedFunction
}

const name = 'unequal'
const dependencies = [
  'typed',
  'config',
  'equalScalar',
  'matrix',
  'DenseMatrix',
  'concat',
  'SparseMatrix'
]

export const createUnequal = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config: _config,
    equalScalar,
    matrix,
    DenseMatrix,
    concat,
    SparseMatrix
  }: UnequalDependencies) => {
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo07xSSf = createMatAlgo07xSSf({ typed, SparseMatrix })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Test whether two values are unequal.
     *
     * The function tests whether the relative difference between x and y is
     * larger than the configured relTol and absTol. The function cannot be used to compare
     * values smaller than approximately 2.22e-16.
     *
     * For matrices, the function is evaluated element wise.
     * In case of complex numbers, x.re must unequal y.re, or x.im must unequal y.im.
     * Strings are compared by their numerical value.
     *
     * Values `null` and `undefined` are compared strictly, thus `null` is unequal
     * with everything except `null`, and `undefined` is unequal with everything
     * except `undefined`.
     *
     * Syntax:
     *
     *    math.unequal(x, y)
     *
     * Examples:
     *
     *    math.unequal(2 + 2, 3)       // returns true
     *    math.unequal(2 + 2, 4)       // returns false
     *
     *    const a = math.unit('50 cm')
     *    const b = math.unit('5 m')
     *    math.unequal(a, b)           // returns false
     *
     *    const c = [2, 5, 1]
     *    const d = [2, 7, 1]
     *
     *    math.unequal(c, d)           // returns [false, true, false]
     *    math.deepEqual(c, d)         // returns false
     *
     *    math.unequal(0, null)        // returns true
     * See also:
     *
     *    equal, deepEqual, smaller, smallerEq, larger, largerEq, compare
     *
     * @param  {number | BigNumber | Fraction | boolean | Complex | Unit | string | Array | Matrix | undefined} x First value to compare
     * @param  {number | BigNumber | Fraction | boolean | Complex | Unit | string | Array | Matrix | undefined} y Second value to compare
     * @return {boolean | Array | Matrix} Returns true when the compared values are unequal, else returns false
     */
    return typed(
      name,
      createUnequalNumber({ typed, equalScalar }),
      matrixAlgorithmSuite({
        elop: _unequal,
        SS: matAlgo07xSSf,
        DS: matAlgo03xDSf,
        Ss: matAlgo12xSfs
      })
    )

    function _unequal(x: unknown, y: unknown): boolean {
      return !equalScalar(x, y)
    }
  }
)

export const createUnequalNumber = factory(
  name,
  ['typed', 'equalScalar'],
  ({ typed, equalScalar }: UnequalNumberDependencies) => {
    return typed(name, {
      'any, any': function (x: unknown, y: unknown): boolean {
        // strict equality for null and undefined?
        if (x === null) {
          return y !== null
        }
        if (y === null) {
          return x !== null
        }
        if (x === undefined) {
          return y !== undefined
        }
        if (y === undefined) {
          return x !== undefined
        }

        return !equalScalar(x, y)
      }
    })
  }
)
