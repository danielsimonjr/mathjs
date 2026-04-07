import { factory } from '../../utils/factory.js'

const name = 'matrixLog'
const dependencies = [
  'typed',
  'eigs',
  'multiply',
  'inv',
  'diag',
  'log',
  'matrix',
  'size',
  'identity'
]

export const createMatrixLog = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, eigs, multiply, inv, diag, log, matrix, size, identity }) => {
    /**
     * Compute the principal matrix logarithm of a square matrix A.
     * Returns a matrix L such that expm(L) ≈ A (where expm is matrix exponential).
     *
     * Uses eigendecomposition: A = V * D * V^(-1), so
     * log(A) = V * diag(log(d_i)) * V^(-1)
     *
     * This implementation works for matrices with real positive eigenvalues.
     * Matrices with negative or complex eigenvalues may not have a real
     * principal logarithm — an error is thrown in that case.
     *
     * Syntax:
     *
     *     math.matrixLog(A)
     *
     * Examples:
     *
     *     math.matrixLog([[1, 0], [0, 1]])
     *     // Returns [[0, 0], [0, 0]]  (log of identity is zero matrix)
     *
     *     math.matrixLog([[Math.E, 0], [0, Math.E * Math.E]])
     *     // Returns approximately [[1, 0], [0, 2]]
     *
     *     math.matrixLog([[2, 1], [0, 2]])
     *     // Matrix logarithm of a Jordan block
     *
     * See also:
     *
     *     eigs, inv, det, matrixRank
     *
     * @param {Array | Matrix} A  A square matrix with positive eigenvalues
     * @return {Array | Matrix}   The principal matrix logarithm of A
     */
    return typed(name, {
      'Array | Matrix': function (A) {
        const isMatrixInput = !Array.isArray(A)
        const dims = size(A)

        if (!Array.isArray(dims) || dims.length !== 2) {
          throw new RangeError('matrixLog: input must be a two-dimensional matrix')
        }
        const n = dims[0]
        if (n !== dims[1]) {
          throw new RangeError('matrixLog: matrix must be square (got ' + dims[0] + 'x' + dims[1] + ')')
        }

        const result = _matrixLog(isMatrixInput ? A.toArray() : A, n)
        return isMatrixInput ? matrix(result) : result
      }
    })

    function _matrixLog (A, n) {
      if (n === 0) return []
      if (n === 1) return [[Math.log(A[0][0])]]

      // Eigendecomposition of A
      const eigResult = eigs(A, { eigenvectors: true })

      // Build diagonal of log(eigenvalues)
      const logEigVals = eigResult.eigenvectors.map((ev) => {
        const val = ev.value
        const re = _realPart(val)
        const im = _imagPart(val)

        if (Math.abs(im) > 1e-10 * Math.max(1, Math.abs(re))) {
          throw new Error(
            'matrixLog: matrix has complex eigenvalues; ' +
            'real matrix logarithm does not exist. ' +
            'Eigenvalue: ' + re + ' + ' + im + 'i'
          )
        }
        if (re <= 0) {
          throw new Error(
            'matrixLog: matrix has non-positive eigenvalue ' + re +
            '; real principal matrix logarithm does not exist'
          )
        }
        return Math.log(re)
      })

      // Build eigenvector matrix V  (columns = eigenvectors)
      const eigvecs = eigResult.eigenvectors
      const V = []
      for (let i = 0; i < n; i++) {
        V[i] = []
        for (let j = 0; j < n; j++) {
          const vec = Array.isArray(eigvecs[j].vector)
            ? eigvecs[j].vector
            : eigvecs[j].vector.toArray()
          V[i][j] = _realPart(vec[i])
        }
      }

      // log(A) = V * diag(logEigVals) * V^{-1}
      const Vinv = inv(V)

      // Build diag matrix
      const D = []
      for (let i = 0; i < n; i++) {
        D[i] = new Array(n).fill(0)
        D[i][i] = logEigVals[i]
      }

      const VD = _multiplyArrays(V, D)
      const result = _multiplyArrays(VD, _toArray2D(Vinv))

      return result
    }

    function _realPart (val) {
      if (val && typeof val === 'object' && 're' in val) return val.re
      return Number(val)
    }

    function _imagPart (val) {
      if (val && typeof val === 'object' && 'im' in val) return val.im
      return 0
    }

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

    function _toArray2D (M) {
      if (Array.isArray(M)) return M
      return M.toArray()
    }
  }
)
