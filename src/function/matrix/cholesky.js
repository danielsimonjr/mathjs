import { factory } from '../../utils/factory.js'

const name = 'cholesky'
const dependencies = ['typed', 'matrix', 'sqrt', 'zeros']

export const createCholesky = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, sqrt, zeros }) => {
    /**
     * Compute the Cholesky decomposition of a symmetric positive definite matrix A.
     * Returns a lower triangular matrix L such that A = L * L^T.
     *
     * Syntax:
     *
     *     math.cholesky(A)
     *
     * Examples:
     *
     *     math.cholesky([[4, 2], [2, 3]])
     *     // Returns lower triangular L where L * L^T = A
     *
     * See also:
     *
     *     qr, lup, svd, eigs
     *
     * @param {Array | Matrix} A  A symmetric positive definite matrix
     * @return {Array | Matrix}   Lower triangular matrix L
     */
    return typed(name, {
      Array: function (A) {
        return _cholesky(A)
      },

      Matrix: function (A) {
        return matrix(_cholesky(A.toArray()))
      }
    })

    function _cholesky (A) {
      const n = A.length
      for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
          throw new Error('cholesky: matrix must be square')
        }
      }

      // Initialize L as zero matrix
      const L = []
      for (let i = 0; i < n; i++) {
        L.push(new Array(n).fill(0))
      }

      for (let j = 0; j < n; j++) {
        // Diagonal element
        let sum = 0
        for (let k = 0; k < j; k++) {
          sum += L[j][k] * L[j][k]
        }
        const diag = A[j][j] - sum
        if (diag < 0) {
          throw new Error(
            'cholesky: matrix is not positive definite (negative value under square root at index ' + j + ')'
          )
        }
        L[j][j] = Math.sqrt(diag)

        // Below-diagonal elements in column j
        for (let i = j + 1; i < n; i++) {
          let s = 0
          for (let k = 0; k < j; k++) {
            s += L[i][k] * L[j][k]
          }
          if (L[j][j] === 0) {
            throw new Error('cholesky: matrix is not positive definite (zero diagonal encountered)')
          }
          L[i][j] = (A[i][j] - s) / L[j][j]
        }
      }

      return L
    }
  }
)
