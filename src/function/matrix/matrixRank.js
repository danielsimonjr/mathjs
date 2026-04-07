import { factory } from '../../utils/factory.js'

const name = 'matrixRank'
const dependencies = ['typed', 'svd', 'size']

export const createMatrixRank = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, svd, size }) => {
    /**
     * Compute the numerical rank of a matrix using Singular Value Decomposition.
     * The rank is the number of singular values that exceed a threshold tolerance.
     *
     * Syntax:
     *
     *     math.matrixRank(A)
     *     math.matrixRank(A, tol)
     *
     * Examples:
     *
     *     math.matrixRank([[1, 2], [3, 4]])          // returns 2
     *     math.matrixRank([[1, 2, 3], [2, 4, 6]])    // returns 1 (rank-deficient)
     *     math.matrixRank([[1, 0], [0, 1]])           // returns 2
     *     math.matrixRank([[1, 2], [2, 4]], 1e-10)   // returns 1
     *
     * See also:
     *
     *     svd, det, nullSpace
     *
     * @param {Array | Matrix} A    A two-dimensional matrix
     * @param {number} [tol]        Optional tolerance for singular value threshold.
     *                              Defaults to max(m, n) * eps * S[0] where eps = 2.2e-16.
     * @return {number}  The numerical rank of A
     */
    return typed(name, {
      'Array | Matrix': function (A) {
        return _matrixRank(A, null)
      },

      'Array | Matrix, number': function (A, tol) {
        return _matrixRank(A, tol)
      }
    })

    function _matrixRank (A, tol) {
      const dims = size(A)
      if (!Array.isArray(dims) || dims.length !== 2) {
        throw new RangeError('matrixRank: input must be a two-dimensional matrix')
      }
      const m = dims[0]
      const n = dims[1]

      if (m === 0 || n === 0) return 0

      const { S } = svd(A)

      // Use sqrt(eps) ≈ 1.5e-8 as effective epsilon because the eigs-based
      // SVD algorithm introduces numerical errors at the 1e-8 level, much
      // larger than machine epsilon 2.2e-16.
      const eps = 1.4901161193847656e-8 // sqrt(2.22e-16)
      const threshold = (tol !== null && tol !== undefined)
        ? tol
        : Math.max(m, n) * eps * (S.length > 0 ? S[0] : 0)

      let rank = 0
      for (let i = 0; i < S.length; i++) {
        if (S[i] > threshold) rank++
      }
      return rank
    }
  }
)
