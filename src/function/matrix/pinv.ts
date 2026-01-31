import { isMatrix } from '../../utils/is.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { format } from '../../utils/string.ts'
import { clone } from '../../utils/object.ts'

// Type definitions
import type { BigNumber } from 'bignumber.js'
import type Complex from 'complex.js'

/** Scalar types supported by pinv */
type Scalar = number | BigNumber | Complex

/** Nested array of scalar values */
type NestedArray<T = Scalar> = T | NestedArray<T>[]

/** Matrix data can be nested arrays of scalars */
type MatrixData = NestedArray<Scalar>

/** Typed function interface for math.js functions */
interface TypedFunction<R = Scalar> {
  (...args: unknown[]): R
  find(func: TypedFunction, signature: string[]): TypedFunction<R>
}

/** Matrix interface */
interface Matrix {
  type: string
  storage(): string
  datatype(): string | undefined
  size(): number[]
  clone(): Matrix
  toArray(): MatrixData
  valueOf(): MatrixData
  _data?: MatrixData
  _size?: number[]
  _datatype?: string
}

/** Matrix constructor function */
interface MatrixConstructor {
  (data: Scalar[] | Scalar[][], storage?: 'dense' | 'sparse'): Matrix
}

/** Complex number constructor */
interface ComplexConstructor {
  (re: number, im: number): Complex
}

/** Result of rank factorization */
interface RankFactResult {
  C: Scalar[][]
  F: Scalar[][]
}

/** Dependencies for pinv factory */
interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  inv: TypedFunction<Scalar[][] | Matrix>
  deepEqual: TypedFunction<boolean>
  equal: TypedFunction<boolean>
  dotDivide: TypedFunction<Scalar | Scalar[]>
  dot: TypedFunction<Scalar>
  ctranspose: TypedFunction<Scalar[][] | Matrix>
  divideScalar: TypedFunction<Scalar>
  multiply: TypedFunction<Scalar | Scalar[][] | Matrix>
  add: TypedFunction<Scalar>
  Complex: ComplexConstructor
}

const name = 'pinv'
const dependencies = [
  'typed',
  'matrix',
  'inv',
  'deepEqual',
  'equal',
  'dotDivide',
  'dot',
  'ctranspose',
  'divideScalar',
  'multiply',
  'add',
  'Complex'
]

export const createPinv = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    inv,
    deepEqual,
    equal,
    dotDivide,
    dot,
    ctranspose,
    divideScalar,
    multiply,
    add,
    Complex
  }: Dependencies) => {
    /**
     * Calculate the Moore–Penrose inverse of a matrix.
     *
     * Syntax:
     *
     *     math.pinv(x)
     *
     * Examples:
     *
     *     math.pinv([[1, 2], [3, 4]])          // returns [[-2, 1], [1.5, -0.5]]
     *     math.pinv([[1, 0], [0, 1], [0, 1]])  // returns [[1, 0, 0], [0, 0.5, 0.5]]
     *     math.pinv(4)                         // returns 0.25
     *
     * See also:
     *
     *     inv
     *
     * @param {number | Complex | Array | Matrix} x     Matrix to be inversed
     * @return {number | Complex | Array | Matrix} The inverse of `x`.
     */
    return typed(name, {
      'Array | Matrix': function (x: Scalar[] | Scalar[][] | Matrix): Scalar[] | Scalar[][] | Matrix {
        const size = isMatrix(x) ? (x as Matrix).size() : arraySize(x as Scalar[] | Scalar[][])
        switch (size.length) {
          case 1:
            // vector
            if (_isZeros(x)) return ctranspose(x) // null vector
            if (size[0] === 1) {
              return inv(x) // invertible matrix
            } else {
              return dotDivide(ctranspose(x), dot(x, x)) as Scalar[]
            }

          case 2: {
            // two dimensional array
            if (_isZeros(x)) return ctranspose(x) // zero matrix
            const rows = size[0]
            const cols = size[1]
            if (rows === cols) {
              try {
                return inv(x) // invertible matrix
              } catch (err) {
                if (
                  err instanceof Error &&
                  err.message.match(
                    /Cannot calculate inverse, determinant is zero/
                  )
                ) {
                  // Expected
                } else {
                  throw err
                }
              }
            }
            if (isMatrix(x)) {
              const matX = x as Matrix
              return matrix(
                _pinv(matX.valueOf() as Scalar[][], rows, cols),
                matX.storage() as 'dense' | 'sparse'
              )
            } else {
              // return an Array
              return _pinv(x as Scalar[][], rows, cols)
            }
          }

          default:
            // multi dimensional array
            throw new RangeError(
              'Matrix must be two dimensional ' +
                '(size: ' +
                format(size, {}) +
                ')'
            )
        }
      },

      any: function (x: Scalar): Scalar {
        // scalar
        if (equal(x, 0)) return clone(x) as Scalar // zero
        return divideScalar(1, x)
      }
    })

    /**
     * Calculate the Moore-Penrose inverse of a matrix
     * @param mat     A matrix
     * @param rows    Number of rows
     * @param cols    Number of columns
     * @return pinv   Pseudoinverse matrix
     * @private
     */
    function _pinv(mat: Scalar[][], rows: number, cols: number): Scalar[][] {
      const { C, F } = _rankFact(mat, rows, cols) // TODO: Use SVD instead (may improve precision)
      const Cpinv = multiply(inv(multiply(ctranspose(C), C) as Scalar[][]), ctranspose(C))
      const Fpinv = multiply(ctranspose(F), inv(multiply(F, ctranspose(F)) as Scalar[][]))
      return multiply(Fpinv, Cpinv) as Scalar[][]
    }

    /**
     * Calculate the reduced row echelon form of a matrix
     *
     * Modified from https://rosettacode.org/wiki/Reduced_row_echelon_form
     *
     * @param mat     A matrix
     * @param rows    Number of rows
     * @param cols    Number of columns
     * @return        Reduced row echelon form
     * @private
     */
    function _rref(mat: Scalar[][], rows: number, cols: number): Scalar[][] {
      const M = clone(mat) as Scalar[][]
      let lead = 0
      for (let r = 0; r < rows; r++) {
        if (cols <= lead) {
          return M
        }
        let i = r
        while (_isZero(M[i][lead])) {
          i++
          if (rows === i) {
            i = r
            lead++
            if (cols === lead) {
              return M
            }
          }
        }

        ;[M[i], M[r]] = [M[r], M[i]]

        let val = M[r][lead]
        for (let j = 0; j < cols; j++) {
          M[r][j] = dotDivide(M[r][j], val) as Scalar
        }

        for (let i = 0; i < rows; i++) {
          if (i === r) continue
          val = M[i][lead]
          for (let j = 0; j < cols; j++) {
            M[i][j] = add(M[i][j], multiply(-1, multiply(val, M[r][j])) as Scalar)
          }
        }
        lead++
      }
      return M
    }

    /**
     * Calculate the rank factorization of a matrix
     *
     * @param mat     A matrix (M)
     * @param rows    Number of rows
     * @param cols    Number of columns
     * @return        rank factorization where M = C F
     * @private
     */
    function _rankFact(
      mat: Scalar[][],
      rows: number,
      cols: number
    ): RankFactResult {
      const rref = _rref(mat, rows, cols)
      const C = mat.map((row) =>
        row.filter((_, j) => j < rows && !_isZero(dot(rref[j], rref[j])))
      )
      const F = rref.filter((_, i) => !_isZero(dot(rref[i], rref[i])))
      return { C, F }
    }

    /** Check if a scalar value is zero (handles complex numbers) */
    function _isZero(x: Scalar): boolean {
      return equal(add(x, Complex(1, 1)), add(0, Complex(1, 1)))
    }

    /** Check if an array/matrix contains only zeros */
    function _isZeros(arr: Scalar[] | Scalar[][] | Matrix): boolean {
      return deepEqual(
        add(arr, Complex(1, 1)),
        add(multiply(arr, 0) as Scalar | Scalar[][], Complex(1, 1))
      )
    }
  }
)
