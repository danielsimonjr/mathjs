import { factory } from '../../utils/factory.js'

const name = 'polarDecomposition'
const dependencies = ['typed', 'svd', 'multiply', 'transpose', 'diag', 'matrix']

export const createPolarDecomposition = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, svd, multiply, transpose, diag, matrix }) => {
    /**
     * Compute the polar decomposition of a matrix A = U * P, where U is
     * an orthogonal (unitary) matrix and P is a symmetric positive semidefinite
     * matrix.
     *
     * Uses SVD: A = U_svd * diag(S) * V^T, then:
     *   U = U_svd * V^T  (orthogonal factor)
     *   P = V * diag(S) * V^T  (symmetric positive semidefinite factor)
     *
     * Syntax:
     *
     *     math.polarDecomposition(A)
     *
     * Examples:
     *
     *     math.polarDecomposition([[3, 2], [1, 4]])
     *     // Returns { U: orthogonal matrix, P: symmetric psd matrix }
     *
     * See also:
     *
     *     svd, qr, eigs
     *
     * @param {Array | Matrix} A  A square matrix
     * @return {{ U: Array|Matrix, P: Array|Matrix }}
     *   Object with orthogonal matrix U and symmetric positive semidefinite matrix P
     */
    return typed(name, {
      Array: function (A) {
        return _polarDecomposition(A)
      },

      Matrix: function (A) {
        const result = _polarDecomposition(A.toArray())
        return {
          U: matrix(result.U),
          P: matrix(result.P)
        }
      }
    })

    function _polarDecomposition (A) {
      const m = A.length
      if (m === 0) {
        throw new Error('polarDecomposition: matrix must be non-empty')
      }
      const nCols = A[0].length
      if (m !== nCols) {
        throw new Error('polarDecomposition: matrix must be square')
      }

      // Compute SVD: A = U_svd * diag(S) * V^T
      const { U: Usvd, S, V } = svd(A)

      const Uarr = Array.isArray(Usvd) ? Usvd : Usvd.toArray()
      const Varr = Array.isArray(V) ? V : V.toArray()

      // U = U_svd * V^T
      const Vt = _transpose(Varr)
      const U = _matMul(Uarr, Vt)

      // P = V * diag(S) * V^T
      const n = S.length
      // Build diag(S) as n x n matrix
      const diagS = []
      for (let i = 0; i < n; i++) {
        diagS.push(new Array(n).fill(0))
        diagS[i][i] = S[i]
      }
      const P = _matMul(_matMul(Varr, diagS), Vt)

      return { U, P }
    }

    function _matMul (A, B) {
      const m = A.length
      const n = B[0].length
      const p = B.length
      const C = []
      for (let i = 0; i < m; i++) {
        C.push(new Array(n).fill(0))
        for (let j = 0; j < n; j++) {
          let s = 0
          for (let k = 0; k < p; k++) {
            s += A[i][k] * B[k][j]
          }
          C[i][j] = s
        }
      }
      return C
    }

    function _transpose (A) {
      const m = A.length
      const n = A[0].length
      const T = []
      for (let j = 0; j < n; j++) {
        T.push(new Array(m).fill(0))
        for (let i = 0; i < m; i++) {
          T[j][i] = A[i][j]
        }
      }
      return T
    }
  }
)
