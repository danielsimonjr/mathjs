import { factory } from '../../utils/factory.js'

const name = 'rank'
const dependencies = ['typed']

export const createRank = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the rank of a matrix (the number of linearly independent rows or columns).
     *
     * Uses Gaussian elimination with partial pivoting to find the row echelon form,
     * then counts the non-zero rows based on the given tolerance.
     *
     * Syntax:
     *
     *    math.rank(A)
     *    math.rank(A, tol)
     *
     * Examples:
     *
     *    math.rank([[1, 0], [0, 1]])         // 2
     *    math.rank([[1, 2], [2, 4]])         // 1 (linearly dependent)
     *    math.rank([[1,2,3],[4,5,6],[7,8,9]]) // 2
     *
     * See also:
     *
     *    nullspace, cond, linsolve, det
     *
     * @param {Array} A       The matrix (2D array)
     * @param {number} [tol]  Tolerance for zero detection (default: auto)
     * @return {number}       The rank of the matrix
     */
    return typed(name, {
      Array: function (A) {
        return _rank(A, null)
      },
      'Array, number': function (A, tol) {
        return _rank(A, tol)
      }
    })

    function _rank (A, tol) {
      const m = A.length
      const n = A[0].length

      // Deep copy the matrix
      const M = A.map(row => [...row])

      // Find the default tolerance
      if (tol === null) {
        let maxAbs = 0
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            const v = Math.abs(M[i][j])
            if (v > maxAbs) maxAbs = v
          }
        }
        tol = Math.max(m, n) * Number.EPSILON * maxAbs
        if (tol === 0) tol = 1e-15
      }

      let r = 0 // current rank / pivot row
      for (let col = 0; col < n && r < m; col++) {
        // Find the pivot row
        let pivotRow = -1
        let pivotVal = tol
        for (let row = r; row < m; row++) {
          if (Math.abs(M[row][col]) > pivotVal) {
            pivotVal = Math.abs(M[row][col])
            pivotRow = row
          }
        }

        if (pivotRow === -1) continue // no pivot in this column

        // Swap pivot row to current position r
        if (pivotRow !== r) {
          const tmp = M[r]
          M[r] = M[pivotRow]
          M[pivotRow] = tmp
        }

        // Eliminate below (and above for RREF, but row echelon is enough for rank)
        const pivot = M[r][col]
        for (let row = r + 1; row < m; row++) {
          const factor = M[row][col] / pivot
          for (let k = col; k < n; k++) {
            M[row][k] -= factor * M[r][k]
          }
        }

        r++
      }

      return r
    }
  }
)
