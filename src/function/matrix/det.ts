import { isMatrix } from '../../utils/is.ts'
import { clone } from '../../utils/object.ts'
import { format } from '../../utils/string.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Type definitions
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

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

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
}

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  subtractScalar: TypedFunction
  multiply: TypedFunction
  divideScalar: TypedFunction
  isZero: TypedFunction<boolean>
  unaryMinus: TypedFunction
}

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_DET_THRESHOLD = 16 // 4x4 matrix

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

const name = 'det'
const dependencies = [
  'typed',
  'matrix',
  'subtractScalar',
  'multiply',
  'divideScalar',
  'isZero',
  'unaryMinus'
]

export const createDet = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    subtractScalar,
    multiply,
    divideScalar,
    isZero,
    unaryMinus
  }: Dependencies) => {
    /**
     * Calculate the determinant of a matrix.
     *
     * Syntax:
     *
     *    math.det(x)
     *
     * Examples:
     *
     *    math.det([[1, 2], [3, 4]]) // returns -2
     *
     *    const A = [
     *      [-2, 2, 3],
     *      [-1, 1, 3],
     *      [2, 0, -1]
     *    ]
     *    math.det(A) // returns 6
     *
     * See also:
     *
     *    inv
     *
     * @param {Array | Matrix} x  A matrix
     * @return {number} The determinant of `x`
     */
    return typed(name, {
      any: function (x: any): any {
        return clone(x)
      },

      'Array | Matrix': function det(x: any[] | Matrix): any {
        let size: number[]
        let matrixValue: Matrix

        if (isMatrix(x)) {
          matrixValue = x as Matrix
          size = matrixValue.size()
        } else if (Array.isArray(x)) {
          matrixValue = matrix(x)
          size = matrixValue.size()
        } else {
          // a scalar
          return clone(x)
        }

        switch (size.length) {
          case 0:
            // scalar
            return clone(x)

          case 1:
            // vector
            if (size[0] === 1) {
              return clone(matrixValue.valueOf()[0])
            }
            if (size[0] === 0) {
              return 1 // det of an empty matrix is per definition 1
            } else {
              throw new RangeError(
                'Matrix must be square ' + '(size: ' + format(size, {}) + ')'
              )
            }

          case 2: {
            // two-dimensional array
            const rows = size[0]
            const cols = size[1]
            if (rows === cols) {
              return _det(matrixValue.clone().valueOf() as any[][], rows, cols)
            }
            if (cols === 0) {
              return 1 // det of an empty matrix is per definition 1
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
      }
    })

    /**
     * Calculate the determinant of a matrix
     * @param {Array[][]} matrix  A square, two dimensional matrix
     * @param {number} rows     Number of rows of the matrix (zero-based)
     * @param {number} cols     Number of columns of the matrix (zero-based)
     * @returns {number} det
     * @private
     */
    function _det(matrix: any[][], rows: number, _cols: number): any {
      // Try WASM for large matrices with plain numbers
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        rows * rows >= WASM_DET_THRESHOLD &&
        isPlainNumberMatrix(matrix)
      ) {
        try {
          const flat = flattenToFloat64(matrix, rows, rows)
          const a = wasmLoader.allocateFloat64Array(flat)
          // workPtr needs n*n f64 values for LU decomposition
          const work = wasmLoader.allocateFloat64ArrayEmpty(rows * rows)
          try {
            const result = wasm.laDet(a.ptr, rows, work.ptr)
            return result
          } finally {
            wasmLoader.free(a.ptr)
            wasmLoader.free(work.ptr)
          }
        } catch {
          // Fall back to JS implementation on WASM error
        }
      }

      if (rows === 1) {
        // this is a 1 x 1 matrix
        return clone(matrix[0][0])
      } else if (rows === 2) {
        // this is a 2 x 2 matrix
        // the determinant of [a11,a12;a21,a22] is det = a11*a22-a21*a12
        return subtractScalar(
          multiply(matrix[0][0], matrix[1][1]),
          multiply(matrix[1][0], matrix[0][1])
        )
      } else {
        // Bareiss algorithm
        // this algorithm have same complexity as LUP decomposition (O(n^3))
        // but it preserve precision of floating point more relative to the LUP decomposition
        let negated = false
        const rowIndices: number[] = []
        for (let i = 0; i < rows; i++) {
          rowIndices[i] = i
        }
        for (let k = 0; k < rows; k++) {
          let k_ = rowIndices[k]
          if (isZero(matrix[k_][k])) {
            let _k
            for (_k = k + 1; _k < rows; _k++) {
              if (!isZero(matrix[rowIndices[_k]][k])) {
                k_ = rowIndices[_k]
                rowIndices[_k] = rowIndices[k]
                rowIndices[k] = k_
                negated = !negated
                break
              }
            }
            if (_k === rows) return matrix[k_][k] // some zero of the type
          }
          const piv = matrix[k_][k]
          const piv_ = k === 0 ? 1 : matrix[rowIndices[k - 1]][k - 1]
          for (let i = k + 1; i < rows; i++) {
            const i_ = rowIndices[i]
            for (let j = k + 1; j < rows; j++) {
              matrix[i_][j] = divideScalar(
                subtractScalar(
                  multiply(matrix[i_][j], piv),
                  multiply(matrix[i_][k], matrix[k_][j])
                ),
                piv_
              )
            }
          }
        }
        const det = matrix[rowIndices[rows - 1]][rows - 1]
        return negated ? unaryMinus(det) : det
      }
    }
  }
)
