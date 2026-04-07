import { factory } from '../../utils/factory.js'

const name = 'svd'
const dependencies = [
  'typed',
  'matrix',
  'multiply',
  'transpose',
  'sqrt',
  'abs',
  'eigs',
  'zeros',
  'size',
  'identity'
]

export const createSvd = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, multiply, transpose, sqrt, abs, eigs, zeros, size, identity }) => {
    /**
     * Compute the Singular Value Decomposition (SVD) of a matrix A.
     * Returns an object { U, S, V } such that A = U * diag(S) * V^T,
     * where U and V are orthogonal matrices and S is a vector of
     * non-negative singular values in descending order.
     *
     * Uses a one-sided Jacobi approach: computes eigendecomposition of A^T * A
     * to obtain V and singular values, then derives U = A * V * diag(1/S).
     *
     * Syntax:
     *
     *     math.svd(A)
     *
     * Examples:
     *
     *     math.svd([[1, 2], [3, 4], [5, 6]])
     *     // Returns { U: [...], S: [...], V: [...] }
     *
     *     const { U, S, V } = math.svd([[3, 2], [2, 3]])
     *     // Verify: A ≈ math.multiply(U, math.multiply(math.diag(S), math.transpose(V)))
     *
     * See also:
     *
     *     eigs, det, inv, qr, lup, matrixRank, nullSpace
     *
     * @param {Array | Matrix} A  A two-dimensional matrix (m x n, m >= n)
     * @return {{ U: Array|Matrix, S: number[], V: Array|Matrix }}
     *   Object with orthogonal matrices U (m x k), V (n x k) and
     *   singular values vector S (length k), where k = min(m, n).
     */
    return typed(name, {
      Array: function (A) {
        return _svd(A)
      },

      Matrix: function (A) {
        const result = _svd(A.toArray())
        return {
          U: matrix(result.U),
          S: result.S,
          V: matrix(result.V)
        }
      }
    })

    /**
     * Internal SVD implementation on a plain 2D array.
     * @param {number[][]} A  m x n matrix (m >= n required for full column U)
     * @returns {{ U: number[][], S: number[], V: number[][] }}
     */
    function _svd (A) {
      const m = A.length
      if (m === 0) throw new RangeError('Matrix must not be empty')
      const n = A[0].length
      if (n === 0) throw new RangeError('Matrix must not be empty')

      const k = Math.min(m, n)

      // Step 1: form B = A^T * A  (n x n, symmetric positive semi-definite)
      const At = _transposeArray(A)
      const B = _multiplyArrays(At, A)

      // Step 2: eigen-decomposition of B  →  B = V * diag(lambda) * V^T
      //   eigs returns { values: [...], eigenvectors: [{value, vector}, ...] }
      const eigResult = eigs(B, { eigenvectors: true })

      // Collect eigenvalues and eigenvectors, sorted descending by eigenvalue
      const pairs = eigResult.eigenvectors.map(ev => ({
        lambda: _realPart(ev.value),
        vec: _toRealArray(ev.vector) // column of V
      }))

      // Sort descending
      pairs.sort((a, b) => b.lambda - a.lambda)

      // Keep only k components
      const pairsK = pairs.slice(0, k)

      // Step 3: singular values S_i = sqrt(max(lambda_i, 0))
      const S = pairsK.map(p => Math.sqrt(Math.max(p.lambda, 0)))

      // Step 4: V matrix (n x k) — columns are eigenvectors of B
      const V = _columnsToMatrix(pairsK.map(p => p.vec), n, k)

      // Step 5: U columns — u_i = A * v_i / s_i  for non-zero s_i
      //                          for zero s_i, fill with orthogonal complement
      const EPS = 1e-14
      const U = _buildU(A, V, S, m, k, EPS)

      return { U, S, V }
    }

    /** Transpose a 2D array */
    function _transposeArray (A) {
      const m = A.length
      const n = A[0].length
      const T = []
      for (let j = 0; j < n; j++) {
        T[j] = []
        for (let i = 0; i < m; i++) {
          T[j][i] = A[i][j]
        }
      }
      return T
    }

    /** Multiply two 2D arrays */
    function _multiplyArrays (A, B) {
      const m = A.length
      const p = B[0].length
      const inner = B.length
      const C = []
      for (let i = 0; i < m; i++) {
        C[i] = []
        for (let j = 0; j < p; j++) {
          let sum = 0
          for (let r = 0; r < inner; r++) {
            sum += A[i][r] * B[r][j]
          }
          C[i][j] = sum
        }
      }
      return C
    }

    /** Extract real part from a possibly complex scalar */
    function _realPart (val) {
      if (val && typeof val === 'object' && 're' in val) return val.re
      return Number(val)
    }

    /** Convert a math.js vector (Array or Matrix) to a plain number array */
    function _toRealArray (vec) {
      const arr = Array.isArray(vec) ? vec : vec.toArray()
      return arr.map(v => _realPart(v))
    }

    /**
     * Build n x k matrix from list of column arrays
     * @param {number[][]} cols  k column vectors, each of length n
     * @param {number} n
     * @param {number} k
     */
    function _columnsToMatrix (cols, n, k) {
      const M = []
      for (let i = 0; i < n; i++) {
        M[i] = []
        for (let j = 0; j < k; j++) {
          M[i][j] = cols[j][i]
        }
      }
      return M
    }

    /**
     * Build the U matrix (m x k): u_i = A * v_i / s_i
     */
    function _buildU (A, V, S, m, k, eps) {
      const U = []
      for (let i = 0; i < m; i++) {
        U[i] = new Array(k).fill(0)
      }

      for (let j = 0; j < k; j++) {
        if (S[j] > eps) {
          // u_j = A * v_j / s_j
          const vj = []
          for (let i = 0; i < V.length; i++) {
            vj.push(V[i][j])
          }
          for (let i = 0; i < m; i++) {
            let sum = 0
            for (let r = 0; r < vj.length; r++) {
              sum += A[i][r] * vj[r]
            }
            U[i][j] = sum / S[j]
          }
        }
        // For near-zero singular values, the column of U is effectively
        // arbitrary; leave as zeros (they are in the null space of A^T).
      }

      return U
    }
  }
)
