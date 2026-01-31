import { factory } from '../../../utils/factory.ts'
import { wasmLoader } from '../../../wasm/WasmLoader.ts'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_SCHUR_THRESHOLD = 16 // 4x4 matrix

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

      // WASM fast path for square plain number matrices
      const wasm = wasmLoader.getModule()
      const data = X._data as any[][]
      if (
        wasm &&
        X.storage() === 'dense' &&
        n * n >= WASM_SCHUR_THRESHOLD &&
        data &&
        isPlainNumberMatrix(data)
      ) {
        try {
          const flat = flattenToFloat64(data, n, n)
          const aAlloc = wasmLoader.allocateFloat64Array(flat)
          const qAlloc = wasmLoader.allocateFloat64ArrayEmpty(n * n)
          const tAlloc = wasmLoader.allocateFloat64ArrayEmpty(n * n)
          const workAlloc = wasmLoader.allocateFloat64ArrayEmpty(n * n)

          try {
            const result = wasm.schur(
              aAlloc.ptr,
              n,
              100, // maxIter
              1e-4, // tol
              qAlloc.ptr,
              tAlloc.ptr,
              workAlloc.ptr
            )

            if (result !== 0) {
              // Extract U (Q) from qPtr
              const Udata: number[][] = []
              for (let i = 0; i < n; i++) {
                Udata[i] = []
                for (let j = 0; j < n; j++) {
                  Udata[i][j] = qAlloc.array[i * n + j]
                }
              }

              // Extract T from tPtr
              const Tdata: number[][] = []
              for (let i = 0; i < n; i++) {
                Tdata[i] = []
                for (let j = 0; j < n; j++) {
                  Tdata[i][j] = tAlloc.array[i * n + j]
                }
              }

              const U = matrix(Udata)
              const T = matrix(Tdata)

              return {
                U,
                T,
                toString: function () {
                  return 'U: ' + this.U.toString() + '\nT: ' + this.T.toString()
                }
              }
            }
            // Fall through to JS implementation if WASM failed
          } finally {
            wasmLoader.free(aAlloc.ptr)
            wasmLoader.free(qAlloc.ptr)
            wasmLoader.free(tAlloc.ptr)
            wasmLoader.free(workAlloc.ptr)
          }
        } catch (e) {
          // Fall back to JS implementation on WASM error
        }
      }

      // JavaScript fallback
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
