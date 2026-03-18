import { factory } from '../../../utils/factory.ts'
import { createSolveValidation } from './utils/solveValidation.ts'

// Type definitions
type ScalarValue = number | bigint | { re: number; im: number } | unknown

interface TypedFunction {
  <T>(name: string, signatures: Record<string, (...args: unknown[]) => T>): T
}

interface MatrixConstructor {
  (data: ScalarValue[] | ScalarValue[][]): DenseMatrix | SparseMatrix
}

interface DenseMatrix {
  type: 'DenseMatrix'
  isDenseMatrix: true
  _data: ScalarValue[][]
  _size: number[]
  _datatype?: string
  valueOf(): ScalarValue[][]
}

interface SparseMatrix {
  type: 'SparseMatrix'
  isSparseMatrix: true
  _values?: ScalarValue[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _datatype?: string
  valueOf(): ScalarValue[][]
}

interface DenseMatrixConstructor {
  new (data: {
    data: ScalarValue[][]
    size: number[]
    datatype?: string
  }): DenseMatrix
}

interface ScalarFunction {
  (a: ScalarValue, b: ScalarValue): ScalarValue
}

interface EqualScalarFunction {
  (a: ScalarValue, b: ScalarValue): boolean
}

interface SolveValidationFunction {
  (
    matrix: DenseMatrix | SparseMatrix,
    b: ScalarValue[][] | DenseMatrix | SparseMatrix,
    copy: boolean
  ): DenseMatrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  divideScalar: ScalarFunction
  multiplyScalar: ScalarFunction
  subtractScalar: ScalarFunction
  equalScalar: EqualScalarFunction
  DenseMatrix: DenseMatrixConstructor
}

const name = 'lsolveAll'
const dependencies = [
  'typed',
  'matrix',
  'divideScalar',
  'multiplyScalar',
  'subtractScalar',
  'equalScalar',
  'DenseMatrix'
] as const

export const createLsolveAll = /* #__PURE__ */ factory(
  name,
  dependencies as unknown as string[],
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
     * Finds all solutions of a linear equation system by forwards substitution. Matrix must be a lower triangular matrix.
     *
     * `L * x = b`
     *
     * Syntax:
     *
     *    math.lsolveAll(L, b)
     *
     * Examples:
     *
     *    const a = [[-2, 3], [2, 1]]
     *    const b = [11, 9]
     *    const x = lsolveAll(a, b)  // [ [[-5.5], [20]] ]
     *
     * See also:
     *
     *    lsolve, lup, slu, usolve, lusolve
     *
     * @param {Matrix, Array} L       A N x N matrix or array (L)
     * @param {Matrix, Array} b       A column vector with the b values
     *
     * @return {DenseMatrix[] | Array[]}  An array of affine-independent column vectors (x) that solve the linear system
     */
    return typed(name, {
      'SparseMatrix, Array | Matrix': function (
        m: SparseMatrix,
        b: ScalarValue[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix[] {
        return _sparseForwardSubstitution(m, b)
      },

      'DenseMatrix, Array | Matrix': function (
        m: DenseMatrix,
        b: ScalarValue[][] | DenseMatrix | SparseMatrix
      ): DenseMatrix[] {
        return _denseForwardSubstitution(m, b)
      },

      'Array, Array | Matrix': function (
        a: ScalarValue[][],
        b: ScalarValue[][] | DenseMatrix | SparseMatrix
      ): ScalarValue[][][] {
        const m = matrix(a) as DenseMatrix
        const R = _denseForwardSubstitution(m, b)
        return R.map((r: DenseMatrix) => r.valueOf())
      }
    })

    function _denseForwardSubstitution(
      m: DenseMatrix,
      b_: ScalarValue[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix[] {
      // the algorithm is derived from
      // https://www.overleaf.com/read/csvgqdxggyjv

      // array of right-hand sides
      const B: ScalarValue[][] = [
        solveValidation(m, b_, true)._data.map(
          (e: ScalarValue[]) => e[0]
        ) as ScalarValue[]
      ]

      const M = m._data
      const rows = m._size[0]
      const columns = m._size[1]

      // loop columns
      for (let i = 0; i < columns; i++) {
        let L = B.length

        // loop right-hand sides
        for (let k = 0; k < L; k++) {
          const b = B[k]

          if (!equalScalar(M[i][i], 0)) {
            // non-singular row

            b[i] = divideScalar(b[i], M[i][i])

            for (let j = i + 1; j < columns; j++) {
              // b[j] -= b[i] * M[j,i]
              b[j] = subtractScalar(b[j], multiplyScalar(b[i], M[j][i]))
            }
          } else if (!equalScalar(b[i], 0)) {
            // singular row, nonzero RHS

            if (k === 0) {
              // There is no valid solution
              return []
            } else {
              // This RHS is invalid but other solutions may still exist
              B.splice(k, 1)
              k -= 1
              L -= 1
            }
          } else if (k === 0) {
            // singular row, RHS is zero

            const bNew = [...b]
            bNew[i] = 1

            for (let j = i + 1; j < columns; j++) {
              bNew[j] = subtractScalar(bNew[j], M[j][i])
            }

            B.push(bNew)
          }
        }
      }

      return B.map(
        (x: ScalarValue[]) =>
          new DenseMatrix({
            data: x.map((e: ScalarValue) => [e]),
            size: [rows, 1]
          })
      )
    }

    function _sparseForwardSubstitution(
      m: SparseMatrix,
      b_: ScalarValue[][] | DenseMatrix | SparseMatrix
    ): DenseMatrix[] {
      // array of right-hand sides
      const B: ScalarValue[][] = [
        solveValidation(m, b_, true)._data.map(
          (e: ScalarValue[]) => e[0]
        ) as ScalarValue[]
      ]

      const rows = m._size[0]
      const columns = m._size[1]

      const values = m._values
      const index = m._index
      const ptr = m._ptr

      // loop columns
      for (let i = 0; i < columns; i++) {
        let L = B.length

        // loop right-hand sides
        for (let k = 0; k < L; k++) {
          const b = B[k]

          // values & indices (column i)
          const iValues: ScalarValue[] = []
          const iIndices: number[] = []

          // first & last indeces in column
          const firstIndex = ptr[i]
          const lastIndex = ptr[i + 1]

          // find the value at [i, i]
          let Mii: ScalarValue = 0
          for (let j = firstIndex; j < lastIndex; j++) {
            const J = index[j]
            // check row
            if (J === i) {
              Mii = values![j]
            } else if (J > i) {
              // store lower triangular
              iValues.push(values![j])
              iIndices.push(J)
            }
          }

          if (!equalScalar(Mii, 0)) {
            // non-singular row

            b[i] = divideScalar(b[i], Mii)

            for (let j = 0, lastIdx = iIndices.length; j < lastIdx; j++) {
              const J = iIndices[j]
              b[J] = subtractScalar(b[J], multiplyScalar(b[i], iValues[j]))
            }
          } else if (!equalScalar(b[i], 0)) {
            // singular row, nonzero RHS

            if (k === 0) {
              // There is no valid solution
              return []
            } else {
              // This RHS is invalid but other solutions may still exist
              B.splice(k, 1)
              k -= 1
              L -= 1
            }
          } else if (k === 0) {
            // singular row, RHS is zero

            const bNew = [...b]
            bNew[i] = 1

            for (let j = 0, lastIdx = iIndices.length; j < lastIdx; j++) {
              const J = iIndices[j]
              bNew[J] = subtractScalar(bNew[J], iValues[j])
            }

            B.push(bNew)
          }
        }
      }

      return B.map(
        (x: ScalarValue[]) =>
          new DenseMatrix({
            data: x.map((e: ScalarValue) => [e]),
            size: [rows, 1]
          })
      )
    }
  }
)
