import { isMatrix } from '../../utils/is.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { format } from '../../utils/string.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_INV_THRESHOLD = 16 // 4x4 matrix

// Type definitions
import type { BigNumber } from 'bignumber.js'
import type Complex from 'complex.js'

/** Scalar types supported by inv */
type Scalar = number | BigNumber | Complex

/** Nested array of scalar values */
type NestedArray<T = Scalar> = T | NestedArray<T>[]

/** Matrix data can be nested arrays of scalars */
type MatrixData = NestedArray<Scalar>

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

/** Typed function interface for math.js functions */
interface TypedFunction<R = Scalar> {
  (...args: unknown[]): R
  find(func: TypedFunction, signature: string[]): TypedFunction<R>
}

/** Matrix constructor function */
interface MatrixConstructor {
  (data: Scalar[] | Scalar[][], storage?: 'dense' | 'sparse'): Matrix
}

/** Identity matrix function */
interface IdentityFunction {
  (size: number | number[]): Matrix
}

/** Dependencies for inv factory */
interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  divideScalar: TypedFunction<Scalar>
  addScalar: TypedFunction<Scalar>
  multiply: TypedFunction<Scalar>
  unaryMinus: TypedFunction<Scalar>
  det: TypedFunction<Scalar>
  identity: IdentityFunction
  abs: TypedFunction<number | BigNumber>
}

/**
 * Check if a 2D array contains only plain numbers
 */
function isPlainNumberMatrix(matrix: any[][]): boolean {
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i]
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] !== 'number') {
        return false
      }
    }
  }
  return true
}

/**
 * Flatten a 2D array to a Float64Array in row-major order
 */
function flattenToFloat64(
  matrix: number[][],
  rows: number,
  cols: number
): Float64Array {
  const result = new Float64Array(rows * cols)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i * cols + j] = matrix[i][j]
    }
  }
  return result
}

const name = 'inv'
const dependencies = [
  'typed',
  'matrix',
  'divideScalar',
  'addScalar',
  'multiply',
  'unaryMinus',
  'det',
  'identity',
  'abs'
]

export const createInv = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    divideScalar,
    addScalar,
    multiply,
    unaryMinus,
    det,
    identity,
    abs
  }: Dependencies) => {
    /**
     * Calculate the inverse of a square matrix.
     *
     * Syntax:
     *
     *     math.inv(x)
     *
     * Examples:
     *
     *     math.inv([[1, 2], [3, 4]])  // returns [[-2, 1], [1.5, -0.5]]
     *     math.inv(4)                 // returns 0.25
     *     1 / 4                       // returns 0.25
     *
     * See also:
     *
     *     det, transpose
     *
     * @param {number | Complex | Array | Matrix} x     Matrix to be inversed
     * @return {number | Complex | Array | Matrix} The inverse of `x`.
     */
    return typed(name, {
      'Array | Matrix': function (x: Scalar[] | Matrix): Scalar[] | Matrix {
        const size = isMatrix(x) ? (x as Matrix).size() : arraySize(x as Scalar[])
        switch (size.length) {
          case 1:
            // vector
            if (size[0] === 1) {
              if (isMatrix(x)) {
                const matX = x as Matrix
                return matrix([divideScalar(1, (matX.valueOf() as Scalar[])[0])])
              } else {
                return [divideScalar(1, (x as Scalar[])[0])]
              }
            } else {
              throw new RangeError(
                'Matrix must be square ' + '(size: ' + format(size, {}) + ')'
              )
            }

          case 2: {
            // two dimensional array
            const rows = size[0]
            const cols = size[1]
            if (rows === cols) {
              if (isMatrix(x)) {
                const matX = x as Matrix
                const storage = matX.storage() as 'dense' | 'sparse'
                return matrix(
                  _inv(matX.valueOf() as Scalar[][], rows, cols),
                  storage
                )
              } else {
                // return an Array
                return _inv(x as Scalar[][], rows, cols)
              }
            } else {
              throw new RangeError(
                'Matrix must be square ' + '(size: ' + format(size, {}) + ')'
              )
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
        return divideScalar(1, x) // FIXME: create a BigNumber one when configured for bignumbers
      }
    })

    /**
     * Calculate the inverse of a square matrix
     * @param mat     A square matrix
     * @param rows    Number of rows
     * @param cols    Number of columns, must equal rows
     * @return inv    Inverse matrix
     * @private
     */
    function _inv(mat: Scalar[][], rows: number, cols: number): Scalar[][] {
      let r: number, s: number, f: Scalar, value: Scalar, temp: Scalar[]

      // Try WASM for large matrices with plain numbers
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        rows >= 3 &&
        rows * rows >= WASM_INV_THRESHOLD &&
        isPlainNumberMatrix(mat)
      ) {
        try {
          const flat = flattenToFloat64(mat, rows, rows)
          const input = wasmLoader.allocateFloat64Array(flat)
          const result = wasmLoader.allocateFloat64ArrayEmpty(rows * rows)
          // workPtr needs n * 2n f64 values for augmented matrix
          const work = wasmLoader.allocateFloat64ArrayEmpty(rows * 2 * rows)
          try {
            const success = wasm.laInv(input.ptr, rows, result.ptr, work.ptr)
            if (success === 0) {
              throw Error('Cannot calculate inverse, determinant is zero')
            }
            // Convert flat result back to 2D array
            const invMatrix: number[][] = []
            for (let i = 0; i < rows; i++) {
              const row: number[] = []
              for (let j = 0; j < rows; j++) {
                row[j] = result.array[i * rows + j]
              }
              invMatrix[i] = row
            }
            return invMatrix
          } finally {
            wasmLoader.free(input.ptr)
            wasmLoader.free(result.ptr)
            wasmLoader.free(work.ptr)
          }
        } catch (e) {
          // If it's a singularity error, rethrow it
          if (e instanceof Error && e.message.includes('determinant is zero')) {
            throw e
          }
          // Otherwise fall back to JS implementation on WASM error
        }
      }

      if (rows === 1) {
        // this is a 1 x 1 matrix
        value = mat[0][0]
        if (value === 0) {
          throw Error('Cannot calculate inverse, determinant is zero')
        }
        return [[divideScalar(1, value)]]
      } else if (rows === 2) {
        // this is a 2 x 2 matrix
        const d = det(mat)
        if (d === 0) {
          throw Error('Cannot calculate inverse, determinant is zero')
        }
        return [
          [divideScalar(mat[1][1], d), divideScalar(unaryMinus(mat[0][1]), d)],
          [divideScalar(unaryMinus(mat[1][0]), d), divideScalar(mat[0][0], d)]
        ]
      } else {
        // this is a matrix of 3 x 3 or larger
        // calculate inverse using gauss-jordan elimination
        //      https://en.wikipedia.org/wiki/Gaussian_elimination
        //      http://mathworld.wolfram.com/MatrixInverse.html
        //      http://math.uww.edu/~mcfarlat/inverse.htm

        // make a copy of the matrix (only the arrays, not of the elements)
        const A = mat.concat()
        for (r = 0; r < rows; r++) {
          A[r] = A[r].concat()
        }

        // create an identity matrix which in the end will contain the
        // matrix inverse
        const B = identity(rows).valueOf() as Scalar[][]

        // loop over all columns, and perform row reductions
        for (let c = 0; c < cols; c++) {
          // Pivoting: Swap row c with row r, where row r contains the largest element A[r][c]
          let ABig = abs(A[c][c])
          let rBig = c
          r = c + 1
          while (r < rows) {
            if (abs(A[r][c]) > ABig) {
              ABig = abs(A[r][c])
              rBig = r
            }
            r++
          }
          if (ABig === 0) {
            throw Error('Cannot calculate inverse, determinant is zero')
          }
          r = rBig
          if (r !== c) {
            temp = A[c]
            A[c] = A[r]
            A[r] = temp
            temp = B[c]
            B[c] = B[r]
            B[r] = temp
          }

          // eliminate non-zero values on the other rows at column c
          const Ac = A[c]
          const Bc = B[c]
          for (r = 0; r < rows; r++) {
            const Ar = A[r]
            const Br = B[r]
            if (r !== c) {
              // eliminate value at column c and row r
              if (Ar[c] !== 0) {
                f = divideScalar(unaryMinus(Ar[c]), Ac[c])

                // add (f * row c) to row r to eliminate the value
                // at column c
                for (s = c; s < cols; s++) {
                  Ar[s] = addScalar(Ar[s], multiply(f, Ac[s]))
                }
                for (s = 0; s < cols; s++) {
                  Br[s] = addScalar(Br[s], multiply(f, Bc[s]))
                }
              }
            } else {
              // normalize value at Acc to 1,
              // divide each value on row r with the value at Acc
              f = Ac[c]
              for (s = c; s < cols; s++) {
                Ar[s] = divideScalar(Ar[s], f)
              }
              for (s = 0; s < cols; s++) {
                Br[s] = divideScalar(Br[s], f)
              }
            }
          }
        }
        return B
      }
    }
  }
)
