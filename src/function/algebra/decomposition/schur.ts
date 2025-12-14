import { factory } from '../../../utils/factory.ts'

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

interface IdentityFunction {
  (size: number | number[]): Matrix
}

interface QRResult {
  Q: Matrix
  R: Matrix
}

interface SchurResult {
  U: Matrix
  T: Matrix
  toString(): string
}

interface SchurArrayResult {
  U: any[][]
  T: any[][]
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  identity: IdentityFunction
  multiply: TypedFunction
  qr: TypedFunction<QRResult>
  norm: TypedFunction<number>
  subtract: TypedFunction
}

const name = 'schur'
const dependencies = [
  'typed',
  'matrix',
  'identity',
  'multiply',
  'qr',
  'norm',
  'subtract'
]

export const createSchur = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, identity, multiply, qr, norm, subtract }: Dependencies) => {
    /**
     *
     * Performs a real Schur decomposition of the real matrix A = UTU' where U is orthogonal
     * and T is upper quasi-triangular.
     * https://en.wikipedia.org/wiki/Schur_decomposition
     *
     * Syntax:
     *
     *     math.schur(A)
     *
     * Examples:
     *
     *     const A = [[1, 0], [-4, 3]]
     *     math.schur(A) // returns {T: [[3, 4], [0, 1]], R: [[0, 1], [-1, 0]]}
     *
     * See also:
     *
     *     sylvester, lyap, qr
     *
     * @param {Array | Matrix} A  Matrix A
     * @return {{U: Array | Matrix, T: Array | Matrix}} Object containing both matrix U and T of the Schur Decomposition A=UTU'
     */
    return typed(name, {
      Array: function (X: any[][]): SchurArrayResult {
        const r = _schur(matrix(X))
        return {
          U: r.U.valueOf() as any[][],
          T: r.T.valueOf() as any[][]
        }
      },

      Matrix: function (X: Matrix): SchurResult {
        return _schur(X)
      }
    })

    function _schur(X: Matrix): SchurResult {
      const n = X.size()[0]
      let A: Matrix = X
      let U: Matrix = identity(n)
      let k = 0
      let A0: Matrix
      do {
        A0 = A
        const QR = qr(A)
        const Q = QR.Q
        const R = QR.R
        A = multiply(R, Q) as Matrix
        U = multiply(U, Q) as Matrix
        if (k++ > 100) {
          break
        }
      } while (norm(subtract(A, A0)) > 1e-4)
      return {
        U,
        T: A,
        toString: function () {
          return 'U: ' + this.U.toString() + '\nT: ' + this.T.toString()
        }
      }
    }
  }
)
