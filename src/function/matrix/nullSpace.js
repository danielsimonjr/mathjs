import { factory } from '../../utils/factory.js'

const name = 'nullSpace'
const dependencies = ['typed', 'svd', 'matrix', 'size']

export const createNullSpace = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, svd, matrix, size }) => {
    /**
     * Compute an orthonormal basis for the null space (kernel) of a matrix A.
     * Uses Singular Value Decomposition: the null space basis vectors are the
     * right singular vectors corresponding to near-zero singular values.
     *
     * If A is m x n with rank r, the null space has dimension n - r and the
     * result is a list of (n - r) vectors, each of length n.
     *
     * Syntax:
     *
     *     math.nullSpace(A)
     *     math.nullSpace(A, tol)
     *
     * Examples:
     *
     *     math.nullSpace([[1, 2, 3], [2, 4, 6]])
     *     // Returns basis for the 2-dimensional null space
     *
     *     math.nullSpace([[1, 0], [0, 1]])
     *     // Returns [] (trivial null space for full-rank matrix)
     *
     * See also:
     *
     *     svd, matrixRank, inv
     *
     * @param {Array | Matrix} A    A two-dimensional matrix (m x n)
     * @param {number} [tol]        Optional tolerance for near-zero singular values.
     *                              Defaults to max(m, n) * sqrt(eps) * S[0].
     * @return {Array[] | Matrix[]}  Array of basis vectors (each a plain Array or Matrix
     *                               depending on input type)
     */
    return typed(name, {
      'Array | Matrix': function (A) {
        return _nullSpace(A, null)
      },

      'Array | Matrix, number': function (A, tol) {
        return _nullSpace(A, tol)
      }
    })

    function _nullSpace (A, tol) {
      const isMatrixInput = !Array.isArray(A)
      const dims = size(A)
      if (!Array.isArray(dims) || dims.length !== 2) {
        throw new RangeError('nullSpace: input must be a two-dimensional matrix')
      }
      const m = dims[0]
      const n = dims[1]

      if (m === 0 || n === 0) return []

      const result = svd(A)
      const S = result.S
      // V is n x k where k = min(m, n)
      const V = isMatrixInput ? result.V.toArray() : result.V

      // Use sqrt(eps) ≈ 1.5e-8 as effective epsilon because the eigs-based
      // SVD algorithm introduces numerical errors at the 1e-8 level, much
      // larger than machine epsilon 2.2e-16.
      const sqrtEps = 1.4901161193847656e-8 // sqrt(2.22e-16)
      const threshold = (tol !== null && tol !== undefined)
        ? tol
        : Math.max(m, n) * sqrtEps * (S.length > 0 ? S[0] : 0)

      // k = min(m, n) — number of singular values computed
      const k = S.length

      // Collect right singular vectors corresponding to near-zero singular values.
      // V is n x k, so these vectors are in the column space of V and already
      // orthonormal.
      const nullVectors = []
      for (let j = 0; j < k; j++) {
        if (S[j] <= threshold) {
          const col = []
          for (let i = 0; i < n; i++) {
            col.push(V[i][j])
          }
          nullVectors.push(col)
        }
      }

      // When n > k (i.e., n > m), there are n - k additional null space dimensions
      // that are not captured by V (which is only n x k). We find these by computing
      // the orthogonal complement of all k columns of V using Gram-Schmidt.
      if (n > k) {
        // All k columns of V span the range of A^T (the orthogonal complement of null(A^T)
        // is outside our scope). To find the remaining null space vectors, we compute
        // a basis for R^n that is orthogonal to all k columns of V.
        const colsOfV = []
        for (let j = 0; j < k; j++) {
          const col = []
          for (let i = 0; i < n; i++) col.push(V[i][j])
          colsOfV.push(col)
        }

        // Use Gram-Schmidt to find (n - k) vectors orthogonal to all columns of V
        const orthoComplement = _orthogonalComplement(colsOfV, n, n - k)
        for (const v of orthoComplement) {
          nullVectors.push(v)
        }
      }

      return nullVectors.map(v => isMatrixInput ? matrix(v) : v)
    }

    /**
     * Find `count` orthonormal vectors in R^n that are orthogonal to all given
     * vectors in `existing`. Uses random search + Gram-Schmidt orthogonalization.
     *
     * @param {number[][]} existing  Already-known orthonormal set (each of length n)
     * @param {number} n             Dimension of space
     * @param {number} count         How many new vectors to find
     * @returns {number[][]}         New orthonormal vectors
     */
    function _orthogonalComplement (existing, n, count) {
      const EPS = 1e-12
      const basis = existing.map(v => v.slice()) // copy
      const result = []

      // Try each standard basis vector, then random vectors if needed
      const candidates = []
      for (let i = 0; i < n; i++) {
        const e = new Array(n).fill(0)
        e[i] = 1
        candidates.push(e)
      }

      for (const candidate of candidates) {
        if (result.length >= count) break

        // Gram-Schmidt: project out all known basis vectors
        const v = candidate.slice()
        for (const b of basis) {
          const dot = _dot(v, b)
          for (let i = 0; i < n; i++) {
            v[i] -= dot * b[i]
          }
        }

        const norm = Math.sqrt(_dot(v, v))
        if (norm > EPS) {
          // Normalize
          for (let i = 0; i < n; i++) v[i] /= norm
          result.push(v)
          basis.push(v)
        }
      }

      return result
    }

    function _dot (a, b) {
      let sum = 0
      for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
      return sum
    }
  }
)
