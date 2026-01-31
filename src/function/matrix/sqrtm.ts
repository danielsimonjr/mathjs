import { isMatrix } from '../../utils/is.ts'
import { format } from '../../utils/string.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'

// Type definitions
import type { BigNumber } from 'bignumber.js'
import type Complex from 'complex.js'

/** Scalar types supported by sqrtm */
type Scalar = number | BigNumber | Complex

/** Matrix data representation */
type MatrixData = Scalar | Scalar[] | Scalar[][]

/** Matrix interface */
interface Matrix {
  size(): number[]
  valueOf(): MatrixData
  _data?: MatrixData
  _size?: number[]
}

/** Typed function interface for math.js functions */
interface TypedFunction<R = Scalar | Matrix> {
  (...args: unknown[]): R
}

/** Dependencies for sqrtm factory */
interface Dependencies {
  typed: TypedFunction
  abs: TypedFunction<number | BigNumber>
  add: TypedFunction<Scalar | Matrix>
  multiply: TypedFunction<Scalar | Matrix>
  map: TypedFunction<Matrix>
  sqrt: TypedFunction<Scalar>
  subtract: TypedFunction<Scalar | Matrix>
  inv: TypedFunction<Scalar[][] | Matrix>
  size: TypedFunction<number[]>
  max: TypedFunction<number | BigNumber>
  identity: TypedFunction<Matrix>
}

const name = 'sqrtm'
const dependencies = [
  'typed',
  'abs',
  'add',
  'multiply',
  'map',
  'sqrt',
  'subtract',
  'inv',
  'size',
  'max',
  'identity'
]

export const createSqrtm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    abs,
    add,
    multiply,
    map,
    sqrt,
    subtract,
    inv,
    size,
    max,
    identity
  }: Dependencies) => {
    const _maxIterations = 1e3
    const _tolerance = 1e-6

    /**
     * Calculate the principal square root matrix using the Denman-Beavers iterative method
     *
     * https://en.wikipedia.org/wiki/Square_root_of_a_matrix#By_Denman-Beavers_iteration
     *
     * @param A   The square matrix `A`
     * @return    The principal square root of matrix `A`
     * @private
     */
    function _denmanBeavers(A: Scalar[][] | Matrix): Scalar[][] | Matrix {
      let error: number
      let iterations = 0

      let Y: Scalar[][] | Matrix = A
      let Z: Scalar[][] | Matrix = identity(size(A))

      do {
        const Yk = Y
        Y = multiply(0.5, add(Yk, inv(Z))) as Scalar[][] | Matrix
        Z = multiply(0.5, add(Z, inv(Yk))) as Scalar[][] | Matrix

        error = max(abs(subtract(Y, Yk))) as number

        if (error > _tolerance && ++iterations > _maxIterations) {
          throw new Error(
            'computing square root of matrix: iterative method could not converge'
          )
        }
      } while (error > _tolerance)

      return Y
    }

    /**
     * Calculate the principal square root of a square matrix.
     * The principal square root matrix `X` of another matrix `A` is such that `X * X = A`.
     *
     * https://en.wikipedia.org/wiki/Square_root_of_a_matrix
     *
     * Syntax:
     *
     *     math.sqrtm(A)
     *
     * Examples:
     *
     *     math.sqrtm([[33, 24], [48, 57]]) // returns [[5, 2], [4, 7]]
     *
     * See also:
     *
     *     sqrt, pow
     *
     * @param  {Array | Matrix} A   The square matrix `A`
     * @return {Array | Matrix}     The principal square root of matrix `A`
     */
    return typed(name, {
      'Array | Matrix': function (A: Scalar[] | Scalar[][] | Matrix): Scalar[][] | Matrix {
        const sizeArray = isMatrix(A)
          ? (A as Matrix).size()
          : arraySize(A as Scalar[] | Scalar[][])
        switch (sizeArray.length) {
          case 1:
            // Single element Array | Matrix
            if (sizeArray[0] === 1) {
              return map(A, sqrt)
            } else {
              throw new RangeError(
                'Matrix must be square ' +
                  '(size: ' +
                  format(sizeArray, {}) +
                  ')'
              )
            }

          case 2: {
            // Two-dimensional Array | Matrix
            const rows = sizeArray[0]
            const cols = sizeArray[1]
            if (rows === cols) {
              return _denmanBeavers(A as Scalar[][] | Matrix)
            } else {
              throw new RangeError(
                'Matrix must be square ' +
                  '(size: ' +
                  format(sizeArray, {}) +
                  ')'
              )
            }
          }
          default:
            // Multi dimensional array
            throw new RangeError(
              'Matrix must be at most two dimensional ' +
                '(size: ' +
                format(sizeArray, {}) +
                ')'
            )
        }
      }
    })
  }
)
