import { factory } from '../../utils/factory.js'

const name = 'hessenbergForm'
const dependencies = ['typed', 'matrix', 'zeros', 'identity']

export const createHessenbergForm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, zeros, identity }) => {
    /**
     * Reduce a square matrix A to upper Hessenberg form H using Householder
     * reflections, returning matrices H and Q such that A = Q * H * Q^T.
     *
     * An upper Hessenberg matrix has zeros below the first subdiagonal.
     *
     * Syntax:
     *
     *     math.hessenbergForm(A)
     *
     * Examples:
     *
     *     math.hessenbergForm([[4, 1, 2], [3, 4, 1], [2, 1, 4]])
     *     // Returns { H: upper Hessenberg matrix, Q: orthogonal matrix }
     *
     * See also:
     *
     *     qr, schur, eigs
     *
     * @param {Array | Matrix} A  A square matrix
     * @return {{ H: Array|Matrix, Q: Array|Matrix }}
     *   Object with upper Hessenberg matrix H and orthogonal matrix Q
     *   such that A = Q * H * Q^T
     */
    return typed(name, {
      Array: function (A) {
        return _hessenbergForm(A)
      },

      Matrix: function (A) {
        const result = _hessenbergForm(A.toArray())
        return {
          H: matrix(result.H),
          Q: matrix(result.Q)
        }
      }
    })

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

    function _hessenbergForm (A) {
      const n = A.length
      for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
          throw new Error('hessenbergForm: matrix must be square')
        }
      }

      // Deep copy A into H
      const H = A.map(row => [...row])

      // Initialize Q as identity
      const Q = []
      for (let i = 0; i < n; i++) {
        Q.push(new Array(n).fill(0))
        Q[i][i] = 1
      }

      // Apply Householder reflections for columns 0..n-3
      for (let k = 0; k < n - 2; k++) {
        // Extract column k below the subdiagonal (rows k+1..n-1)
        const x = []
        for (let i = k + 1; i < n; i++) {
          x.push(H[i][k])
        }
        const m = x.length

        // Compute Householder vector v
        let norm = 0
        for (let i = 0; i < m; i++) {
          norm += x[i] * x[i]
        }
        norm = Math.sqrt(norm)

        if (norm < 1e-14) continue

        // v = x + sign(x[0]) * norm * e_1
        const sign = x[0] >= 0 ? 1 : -1
        const v = [...x]
        v[0] += sign * norm

        // Normalize v
        let vNorm = 0
        for (let i = 0; i < m; i++) {
          vNorm += v[i] * v[i]
        }
        vNorm = Math.sqrt(vNorm)
        for (let i = 0; i < m; i++) {
          v[i] /= vNorm
        }

        // Build Householder matrix P = I - 2*v*v^T (size m x m)
        // Apply as: H <- P_k * H * P_k^T where P_k is embedded in n x n
        // Efficiently: update H rows k+1..n-1 and columns k+1..n-1

        // H <- P_k * H: update rows k+1..n-1
        for (let j = 0; j < n; j++) {
          // dot = v^T * H[k+1..n-1, j]
          let dot = 0
          for (let i = 0; i < m; i++) {
            dot += v[i] * H[k + 1 + i][j]
          }
          for (let i = 0; i < m; i++) {
            H[k + 1 + i][j] -= 2 * v[i] * dot
          }
        }

        // H <- H * P_k^T: update columns k+1..n-1
        for (let i = 0; i < n; i++) {
          // dot = H[i, k+1..n-1] * v
          let dot = 0
          for (let j = 0; j < m; j++) {
            dot += H[i][k + 1 + j] * v[j]
          }
          for (let j = 0; j < m; j++) {
            H[i][k + 1 + j] -= 2 * dot * v[j]
          }
        }

        // Q <- Q * P_k^T: accumulate Q
        for (let i = 0; i < n; i++) {
          let dot = 0
          for (let j = 0; j < m; j++) {
            dot += Q[i][k + 1 + j] * v[j]
          }
          for (let j = 0; j < m; j++) {
            Q[i][k + 1 + j] -= 2 * dot * v[j]
          }
        }

        // Zero out below-subdiagonal entries numerically
        for (let i = k + 2; i < n; i++) {
          H[i][k] = 0
        }
      }

      return { H, Q }
    }
  }
)
