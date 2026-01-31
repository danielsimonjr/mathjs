import { factory } from '../../../utils/factory.ts'
import { createSolveValidation } from './utils/solveValidation.ts'
import { wasmLoader } from '../../../wasm/WasmLoader.ts'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_LSOLVE_THRESHOLD = 16 // 4x4 matrix

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface MatrixConstructor {
  (
    data: any[] | any[][],
    storage?: 'dense' | 'sparse'
  ): DenseMatrix | SparseMatrix
}

interface DenseMatrix {
  type: 'DenseMatrix'
  isDenseMatrix: true
  _data: any[][]
  _size: number[]
  _datatype?: string
  valueOf(): any[][]
}

interface SparseMatrix {
  type: 'SparseMatrix'
  isSparseMatrix: true
  _values?: any[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _datatype?: string
  valueOf(): any[][]
}

interface DenseMatrixConstructor {
  new (data: { data: any[][]; size: number[]; datatype?: string }): DenseMatrix
}

interface SolveValidationFunction {
  (
    matrix: DenseMatrix | SparseMatrix,
    b: any[][] | DenseMatrix | SparseMatrix,
    copy: boolean
  ): DenseMatrix
}

interface ScalarFunction {
  (a: any, b: any): any
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  divideScalar: ScalarFunction
  multiplyScalar: ScalarFunction
  subtractScalar: ScalarFunction
  equalScalar: ScalarFunction
  DenseMatrix: DenseMatrixConstructor
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
 * Check if a column vector (2D array with 1 column) contains only plain numbers
 */
function isPlainNumberVector(vec: any[][]): boolean {
  for (let i = 0; i < vec.length; i++) {
    if (typeof vec[i][0] !== 'number') {
      return false
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

/**
 * Extract column vector to Float64Array
 */
function vectorToFloat64(vec: number[][]): Float64Array {
  const result = new Float64Array(vec.length)
  for (let i = 0; i < vec.length; i++) {
    result[i] = vec[i][0]
  }
  return result
}

const name = 'lsolve'
const dependencies = [
  'typed',
  'matrix',
  'divideScalar',
  'multiplyScalar',
  'subtractScalar',
  'equalScalar',
  'DenseMatrix'
]

export const createLsolve = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    divideScalar,
    multiplyScalar,
    subtractScalar,
    equalScalar,
    DenseMatrix
  }: Dependencies) => {
    const solveValidation = createSolveValidation({
      DenseMatrix
    }) as SolveValidationFunction

    /**
     * Finds one solution of a linear equation system by forwards substitution. Matrix must be a lower triangular matrix. Throws an error if there's no solution.
     *
     * `L * x = b`
     *
     * Syntax:
     *
     *    math.lsolve(L, b)
     *
     * Examples:
     *
     *    const a = [[-2, 3], [2, 1]]
     *    const b = [11, 9]
     *    const x = lsolve(a, b)  // [[-5.5], [20]]
     *
     * See also:
     *
     *    lsolveAll, lup, slu, usolve, lusolve
     *
     * @param {Matrix, Array} L       A N x N matrix or array (L)
     * @param {Matrix, Array} b       A column vector with the b values
     *
     * @return {DenseMatrix | Array}  A column vector with the linear system solution (x)
     */
    return typed(name, {
      'SparseMatrix, Array | Matrix': function (
        m: SparseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        return _sparseForwardSubstitution(m, b)
      },

      'DenseMatrix, Array | Matrix': function (
        m: DenseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        return _denseForwardSubstitution(m, b)
      },

      'Array, Array | Matrix': function (
        a: any[][],
        b: any[][] | DenseMatrix | SparseMatrix
      ): any[][] {
        const m = matrix(a) as DenseMatrix
        const r = _denseForwardSubstitution(m, b)
        return r.valueOf()
      }
    })

    function _denseForwardSubstitution(
      m: DenseMatrix,
      b: any[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix {
      // validate matrix and vector, return copy of column vector b
      const bVector = solveValidation(m, b, true)
      const bdata = bVector._data

      const rows = m._size[0]
      const columns = m._size[1]

      const mdata = m._data

      // WASM fast path for plain number matrices
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        rows === columns &&
        rows * rows >= WASM_LSOLVE_THRESHOLD &&
        isPlainNumberMatrix(mdata) &&
        isPlainNumberVector(bdata)
      ) {
        try {
          const lFlat = flattenToFloat64(mdata, rows, columns)
          const bFlat = vectorToFloat64(bdata as number[][])

          const lAlloc = wasmLoader.allocateFloat64Array(lFlat)
          const bAlloc = wasmLoader.allocateFloat64Array(bFlat)
          const resultAlloc = wasmLoader.allocateFloat64ArrayEmpty(rows)

          try {
            const success = wasm.laLsolve(
              lAlloc.ptr,
              bAlloc.ptr,
              rows,
              resultAlloc.ptr
            )
            if (success === 0) {
              throw new Error(
                'Linear system cannot be solved since matrix is singular'
              )
            }
            // Convert result back to column vector
            const x: number[][] = []
            for (let i = 0; i < rows; i++) {
              x[i] = [resultAlloc.array[i]]
            }
            return new DenseMatrix({
              data: x,
              size: [rows, 1]
            })
          } finally {
            wasmLoader.free(lAlloc.ptr)
            wasmLoader.free(bAlloc.ptr)
            wasmLoader.free(resultAlloc.ptr)
          }
        } catch (e) {
          // If it's a singularity error, rethrow it
          if (e instanceof Error && e.message.includes('singular')) {
            throw e
          }
          // Otherwise fall back to JS implementation on WASM error
        }
      }

      // JavaScript fallback
      // result
      const x: any[][] = []

      // loop columns
      for (let j = 0; j < columns; j++) {
        const bj = bdata[j][0] || 0
        let xj: any

        if (!equalScalar(bj, 0)) {
          // non-degenerate row, find solution

          const vjj = mdata[j][j]

          if (equalScalar(vjj, 0)) {
            throw new Error(
              'Linear system cannot be solved since matrix is singular'
            )
          }

          xj = divideScalar(bj, vjj)

          // loop rows
          for (let i = j + 1; i < rows; i++) {
            bdata[i] = [
              subtractScalar(bdata[i][0] || 0, multiplyScalar(xj, mdata[i][j]))
            ]
          }
        } else {
          // degenerate row, we can choose any value
          xj = 0
        }

        x[j] = [xj]
      }

      return new DenseMatrix({
        data: x,
        size: [rows, 1]
      })
    }

    function _sparseForwardSubstitution(
      m: SparseMatrix,
      b: any[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix {
      // validate matrix and vector, return copy of column vector b
      const bVector = solveValidation(m, b, true)

      const bdata = bVector._data

      const rows = m._size[0]
      const columns = m._size[1]

      const values = m._values
      const index = m._index
      const ptr = m._ptr

      // result
      const x: any[][] = []

      // loop columns
      for (let j = 0; j < columns; j++) {
        const bj = bdata[j][0] || 0

        if (!equalScalar(bj, 0)) {
          // non-degenerate row, find solution

          let vjj: any = 0
          // matrix values & indices (column j)
          const jValues: any[] = []
          const jIndices: number[] = []

          // first and last index in the column
          const firstIndex = ptr[j]
          const lastIndex = ptr[j + 1]

          // values in column, find value at [j, j]
          for (let k = firstIndex; k < lastIndex; k++) {
            const i = index[k]

            // check row (rows are not sorted!)
            if (i === j) {
              vjj = values![k]
            } else if (i > j) {
              // store lower triangular
              jValues.push(values![k])
              jIndices.push(i)
            }
          }

          // at this point we must have a value in vjj
          if (equalScalar(vjj, 0)) {
            throw new Error(
              'Linear system cannot be solved since matrix is singular'
            )
          }

          const xj = divideScalar(bj, vjj)

          for (let k = 0, l = jIndices.length; k < l; k++) {
            const i = jIndices[k]
            bdata[i] = [
              subtractScalar(bdata[i][0] || 0, multiplyScalar(xj, jValues[k]))
            ]
          }

          x[j] = [xj]
        } else {
          // degenerate row, we can choose any value
          x[j] = [0]
        }
      }

      return new DenseMatrix({
        data: x,
        size: [rows, 1]
      })
    }
  }
)
