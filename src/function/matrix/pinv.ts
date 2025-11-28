import { isMatrix } from '../../utils/is.js'
import { arraySize } from '../../utils/array.js'
import { factory } from '../../utils/factory.js'
import { format } from '../../utils/string.js'
import { clone } from '../../utils/object.js'

// Type definitions
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
}

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

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface ComplexConstructor {
  (re: number, im: number): any
}

interface RankFactResult {
  C: any[][]
  F: any[][]
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  inv: TypedFunction
  deepEqual: TypedFunction<boolean>
  equal: TypedFunction<boolean>
  dotDivide: TypedFunction
  dot: TypedFunction
  ctranspose: TypedFunction
  divideScalar: TypedFunction
  multiply: TypedFunction
  add: TypedFunction
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

export const createPinv = /* #__PURE__ */ factory(name, dependencies, ({
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
    'Array | Matrix': function (x: any[] | Matrix): any[] | Matrix {
      const size = isMatrix(x) ? (x as Matrix).size() : arraySize(x as any[])
      switch (size.length) {
        case 1:
          // vector
          if (_isZeros(x)) return ctranspose(x) // null vector
          if (size[0] === 1) {
            return inv(x) // invertible matrix
          } else {
            return dotDivide(ctranspose(x), dot(x, x))
          }

        case 2:
        // two dimensional array
        {
          if (_isZeros(x)) return ctranspose(x) // zero matrix
          const rows = size[0]
          const cols = size[1]
          if (rows === cols) {
            try {
              return inv(x) // invertible matrix
            } catch (err) {
              if (err instanceof Error && err.message.match(/Cannot calculate inverse, determinant is zero/)) {
                // Expected
              } else {
                throw err
              }
            }
          }
          if (isMatrix(x)) {
            const matX = x as Matrix
            return matrix(
              _pinv(matX.valueOf() as any[][], rows, cols),
              matX.storage() as 'dense' | 'sparse'
            )
          } else {
            // return an Array
            return _pinv(x as any[][], rows, cols)
          }
        }

        default:
          // multi dimensional array
          throw new RangeError('Matrix must be two dimensional ' +
          '(size: ' + format(size) + ')')
      }
    },

    any: function (x: any): any {
      // scalar
      if (equal(x, 0)) return clone(x) // zero
      return divideScalar(1, x)
    }
  })

  /**
   * Calculate the Moore–Penrose inverse of a matrix
   * @param {any[][]} mat     A matrix
   * @param {number} rows     Number of rows
   * @param {number} cols     Number of columns
   * @return {any[][]} pinv    Pseudoinverse matrix
   * @private
   */
  function _pinv (mat: any[][], rows: number, cols: number): any[][] {
    const { C, F } = _rankFact(mat, rows, cols) // TODO: Use SVD instead (may improve precision)
    const Cpinv = multiply(inv(multiply(ctranspose(C), C)), ctranspose(C))
    const Fpinv = multiply(ctranspose(F), inv(multiply(F, ctranspose(F))))
    return multiply(Fpinv, Cpinv) as any[][]
  }

  /**
   * Calculate the reduced row echelon form of a matrix
   *
   * Modified from https://rosettacode.org/wiki/Reduced_row_echelon_form
   *
   * @param {any[][]} mat     A matrix
   * @param {number} rows     Number of rows
   * @param {number} cols     Number of columns
   * @return {any[][]}        Reduced row echelon form
   * @private
   */
  function _rref (mat: any[][], rows: number, cols: number): any[][] {
    const M = clone(mat) as any[][]
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

      [M[i], M[r]] = [M[r], M[i]]

      let val = M[r][lead]
      for (let j = 0; j < cols; j++) {
        M[r][j] = dotDivide(M[r][j], val)
      }

      for (let i = 0; i < rows; i++) {
        if (i === r) continue
        val = M[i][lead]
        for (let j = 0; j < cols; j++) {
          M[i][j] = add(M[i][j], multiply(-1, multiply(val, M[r][j])))
        }
      }
      lead++
    }
    return M
  }

  /**
   * Calculate the rank factorization of a matrix
   *
   * @param {any[][]} mat                  A matrix (M)
   * @param {number} rows                  Number of rows
   * @param {number} cols                  Number of columns
   * @return {{C: any[][], F: any[][]}}    rank factorization where M = C F
   * @private
   */
  function _rankFact (mat: any[][], rows: number, cols: number): RankFactResult {
    const rref = _rref(mat, rows, cols)
    const C = mat.map((_, i) => _.filter((_, j) => j < rows && !_isZero(dot(rref[j], rref[j]))))
    const F = rref.filter((_, i) => !_isZero(dot(rref[i], rref[i])))
    return { C, F }
  }

  function _isZero (x: any): boolean {
    return equal(add(x, Complex(1, 1)), add(0, Complex(1, 1)))
  }

  function _isZeros (arr: any): boolean {
    return deepEqual(add(arr, Complex(1, 1)), add(multiply(arr, 0), Complex(1, 1)))
  }
})
