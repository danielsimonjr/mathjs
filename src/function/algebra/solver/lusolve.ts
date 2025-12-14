import { isArray, isMatrix } from '../../../utils/is.ts'
import { factory } from '../../../utils/factory.ts'
import { createSolveValidation } from './utils/solveValidation.ts'
import { csIpvec } from '../sparse/csIpvec.ts'

// Type definitions
type _MatrixData = any[][] // eslint-disable-line @typescript-eslint/no-unused-vars

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
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  valueOf(): any[][]
}

interface DenseMatrixConstructor {
  new (data: { data: any[][]; size: number[]; datatype?: string }): DenseMatrix
}

interface LUPDecomposition {
  L: DenseMatrix | SparseMatrix | any[][]
  U: DenseMatrix | SparseMatrix | any[][]
  p: number[] | null
  q?: number[] | null
}

interface SolveValidationFunction {
  (
    matrix: DenseMatrix | SparseMatrix,
    b: any[][] | DenseMatrix | SparseMatrix,
    copy: boolean
  ): DenseMatrix
}

interface LupFunction {
  (matrix: DenseMatrix | SparseMatrix | any[][]): LUPDecomposition
}

interface SluFunction {
  (matrix: SparseMatrix, order: number, threshold: number): LUPDecomposition
}

interface LsolveFunction {
  (L: DenseMatrix | SparseMatrix, b: DenseMatrix): DenseMatrix
}

interface UsolveFunction {
  (U: DenseMatrix | SparseMatrix, b: DenseMatrix): DenseMatrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  lup: LupFunction
  slu: SluFunction
  usolve: UsolveFunction
  lsolve: LsolveFunction
  DenseMatrix: DenseMatrixConstructor
}

const name = 'lusolve'
const dependencies = [
  'typed',
  'matrix',
  'lup',
  'slu',
  'usolve',
  'lsolve',
  'DenseMatrix'
]

export const createLusolve = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, lup, slu, usolve, lsolve, DenseMatrix }: Dependencies) => {
    const solveValidation = createSolveValidation({
      DenseMatrix
    }) as SolveValidationFunction

    /**
     * Solves the linear system `A * x = b` where `A` is an [n x n] matrix and `b` is a [n] column vector.
     *
     * Syntax:
     *
     *    math.lusolve(A, b)     // returns column vector with the solution to the linear system A * x = b
     *    math.lusolve(lup, b)   // returns column vector with the solution to the linear system A * x = b, lup = math.lup(A)
     *
     * Examples:
     *
     *    const m = [[1, 0, 0, 0], [0, 2, 0, 0], [0, 0, 3, 0], [0, 0, 0, 4]]
     *
     *    const x = math.lusolve(m, [-1, -1, -1, -1])        // x = [[-1], [-0.5], [-1/3], [-0.25]]
     *
     *    const f = math.lup(m)
     *    const x1 = math.lusolve(f, [-1, -1, -1, -1])       // x1 = [[-1], [-0.5], [-1/3], [-0.25]]
     *    const x2 = math.lusolve(f, [1, 2, 1, -1])          // x2 = [[1], [1], [1/3], [-0.25]]
     *
     *    const a = [[-2, 3], [2, 1]]
     *    const b = [11, 9]
     *    const x = math.lusolve(a, b)  // [[2], [5]]
     *
     * See also:
     *
     *    lup, slu, lsolve, usolve
     *
     * @param {Matrix | Array | Object} A      Invertible Matrix or the Matrix LU decomposition
     * @param {Matrix | Array} b               Column Vector
     * @param {number} [order]                 The Symbolic Ordering and Analysis order, see slu for details. Matrix must be a SparseMatrix
     * @param {Number} [threshold]             Partial pivoting threshold (1 for partial pivoting), see slu for details. Matrix must be a SparseMatrix.
     *
     * @return {DenseMatrix | Array}           Column vector with the solution to the linear system A * x = b
     */
    return typed(name, {
      'Array, Array | Matrix': function (
        a: any[][],
        b: any[][] | DenseMatrix | SparseMatrix
      ): any[][] {
        const aMatrix = matrix(a)
        const d = lup(aMatrix)
        const x = _lusolve(d.L, d.U, d.p, null, b)
        return x.valueOf()
      },

      'DenseMatrix, Array | Matrix': function (
        a: DenseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        const d = lup(a)
        return _lusolve(d.L, d.U, d.p, null, b)
      },

      'SparseMatrix, Array | Matrix': function (
        a: SparseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        const d = lup(a)
        return _lusolve(d.L, d.U, d.p, null, b)
      },

      'SparseMatrix, Array | Matrix, number, number': function (
        a: SparseMatrix,
        b: any[][] | DenseMatrix | SparseMatrix,
        order: number,
        threshold: number
      ): DenseMatrix {
        const d = slu(a, order, threshold)
        return _lusolve(d.L, d.U, d.p, d.q, b)
      },

      'Object, Array | Matrix': function (
        d: LUPDecomposition,
        b: any[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix {
        return _lusolve(d.L, d.U, d.p, d.q, b)
      }
    })

    function _toMatrix(
      a: DenseMatrix | SparseMatrix | any[][]
    ): DenseMatrix | SparseMatrix {
      if (isMatrix(a)) {
        return a as DenseMatrix | SparseMatrix
      }
      if (isArray(a)) {
        return matrix(a)
      }
      throw new TypeError('Invalid Matrix LU decomposition')
    }

    function _lusolve(
      l: DenseMatrix | SparseMatrix | any[][],
      u: DenseMatrix | SparseMatrix | any[][],
      p: number[] | null | undefined,
      q: number[] | null | undefined,
      b: any[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix {
      // verify decomposition
      const L = _toMatrix(l)
      const U = _toMatrix(u)

      // apply row permutations if needed (b is a DenseMatrix)
      let bMatrix: DenseMatrix
      if (p) {
        bMatrix = solveValidation(L, b, true)
        bMatrix._data = csIpvec(p, bMatrix._data) as any[][]
      } else {
        bMatrix = solveValidation(L, b, true)
      }

      // use forward substitution to resolve L * y = b
      const y = lsolve(L, bMatrix)
      // use backward substitution to resolve U * x = y
      const x = usolve(U, y)

      // apply column permutations if needed (x is a DenseMatrix)
      if (q) {
        x._data = csIpvec(q, x._data) as any[][]
      }

      return x
    }
  }
)
