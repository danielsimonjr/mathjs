import { factory } from '../../../utils/factory.ts'
import { createSolveValidation } from './utils/solveValidation.ts'

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

const name = 'usolve'
const dependencies = [
  'typed',
  'matrix',
  'divideScalar',
  'multiplyScalar',
  'subtractScalar',
  'equalScalar',
  'DenseMatrix'
]

export const createUsolve = /* #__PURE__ */ factory(
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
     * Finds one solution of a linear equation system by backward substitution. Matrix must be an upper triangular matrix. Throws an error if there's no solution.
     *
     * `U * x = b`
     *
     * Syntax:
     *
     *    math.usolve(U, b)
     *
     * Examples:
     *
     *    const a = [[-2, 3], [2, 1]]
     *    const b = [11, 9]
     *    const x = usolve(a, b)  // [[8], [9]]
     *
     * See also:
     *
     *    usolveAll, lup, slu, usolve, lusolve
     *
     * @param {Matrix, Array} U       A N x N matrix or array (U)
     * @param {Matrix, Array} b       A column vector with the b values
     *
     * @return {DenseMatrix | Array}  A column vector with the linear system solution (x)
     */
    return typed(name, {
      'SparseMatrix, Array | Matrix': function (
        m: SparseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        return _sparseBackwardSubstitution(m, b)
      },

      'DenseMatrix, Array | Matrix': function (
        m: DenseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        return _denseBackwardSubstitution(m, b)
      },

      'Array, Array | Matrix': function (
        a: any[][],
        b: any[][] | DenseMatrix | SparseMatrix
      ): any[][] {
        const m = matrix(a) as DenseMatrix
        const r = _denseBackwardSubstitution(m, b)
        return r.valueOf()
      }
    })

    function _denseBackwardSubstitution(
      m: DenseMatrix,
      b: any[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix {
      // make b into a column vector
      const bVector = solveValidation(m, b, true)

      const bdata = bVector._data

      const rows = m._size[0]
      const columns = m._size[1]

      // result
      const x: any[][] = []

      const mdata = m._data
      // loop columns backwards
      for (let j = columns - 1; j >= 0; j--) {
        // b[j]
        const bj = bdata[j][0] || 0
        // x[j]
        let xj: any

        if (!equalScalar(bj, 0)) {
          // value at [j, j]
          const vjj = mdata[j][j]

          if (equalScalar(vjj, 0)) {
            // system cannot be solved
            throw new Error(
              'Linear system cannot be solved since matrix is singular'
            )
          }

          xj = divideScalar(bj, vjj)

          // loop rows
          for (let i = j - 1; i >= 0; i--) {
            // update copy of b
            bdata[i] = [
              subtractScalar(bdata[i][0] || 0, multiplyScalar(xj, mdata[i][j]))
            ]
          }
        } else {
          // zero value at j
          xj = 0
        }
        // update x
        x[j] = [xj]
      }

      return new DenseMatrix({
        data: x,
        size: [rows, 1]
      })
    }

    function _sparseBackwardSubstitution(
      m: SparseMatrix,
      b: any[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix {
      // make b into a column vector
      const bVector = solveValidation(m, b, true)

      const bdata = bVector._data

      const rows = m._size[0]
      const columns = m._size[1]

      const values = m._values
      const index = m._index
      const ptr = m._ptr

      // result
      const x: any[][] = []

      // loop columns backwards
      for (let j = columns - 1; j >= 0; j--) {
        const bj = bdata[j][0] || 0

        if (!equalScalar(bj, 0)) {
          // non-degenerate row, find solution

          let vjj: any = 0

          // upper triangular matrix values & index (column j)
          const jValues: any[] = []
          const jIndices: number[] = []

          // first & last indeces in column
          const firstIndex = ptr[j]
          const lastIndex = ptr[j + 1]

          // values in column, find value at [j, j], loop backwards
          for (let k = lastIndex - 1; k >= firstIndex; k--) {
            const i = index[k]

            // check row (rows are not sorted!)
            if (i === j) {
              vjj = values![k]
            } else if (i < j) {
              // store upper triangular
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

          for (let k = 0, lastIndex = jIndices.length; k < lastIndex; k++) {
            const i = jIndices[k]
            bdata[i] = [
              subtractScalar(bdata[i][0], multiplyScalar(xj, jValues[k]))
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
