import { factory } from '../../utils/factory.js'

const name = 'nullspace'
const dependencies = ['typed']

export const createNullspace = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the null space (kernel) of a matrix.
     *
     * Returns an array of basis vectors for the null space of A. If the matrix
     * has full column rank, returns an empty array.
     *
     * Syntax:
     *
     *    math.nullspace(A)
     *
     * Examples:
     *
     *    math.nullspace([[1, 2], [2, 4]])       // [[-2, 1]] (up to scale)
     *    math.nullspace([[1, 0], [0, 1]])       // [] (full rank)
     *    math.nullspace([[1,2,3],[4,5,6],[7,8,9]]) // two basis vectors
     *
     * See also:
     *
     *    rank, cond, linsolve
     *
     * @param {Array} A    The matrix (2D array, m x n)
     * @return {Array}     Array of basis vectors for the null space
     */
    return typed(name, {
      Array: function (A) {
        return _nullspace(A)
      }
    })

    function _nullspace (A) {
      const m = A.length
      const n = A[0].length

      // Find default tolerance
      let maxAbs = 0
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const v = Math.abs(A[i][j])
          if (v > maxAbs) maxAbs = v
        }
      }
      const tol = Math.max(m, n) * Number.EPSILON * maxAbs || 1e-15

      // Work on a copy augmented with column indices for tracking pivots
      const M = A.map(row => [...row])

      const pivotCols = [] // columns with pivots
      let r = 0
      const pivotCol = new Array(n).fill(-1) // pivotCol[j] = row index if j is pivot column

      for (let col = 0; col < n && r < m; col++) {
        // Find pivot
        let pivotRow = -1
        let pivotVal = tol
        for (let row = r; row < m; row++) {
          if (Math.abs(M[row][col]) > pivotVal) {
            pivotVal = Math.abs(M[row][col])
            pivotRow = row
          }
        }

        if (pivotRow === -1) continue

        // Swap
        if (pivotRow !== r) {
          const tmp = M[r]
          M[r] = M[pivotRow]
          M[pivotRow] = tmp
        }

        // Normalize pivot row
        const pivot = M[r][col]
        for (let k = 0; k < n; k++) {
          M[r][k] /= pivot
        }

        // Eliminate in all other rows (RREF)
        for (let row = 0; row < m; row++) {
          if (row === r) continue
          const factor = M[row][col]
          if (Math.abs(factor) < tol) continue
          for (let k = 0; k < n; k++) {
            M[row][k] -= factor * M[r][k]
          }
        }

        pivotCols.push(col)
        pivotCol[col] = r
        r++
      }

      // Free columns are those not in pivotCols
      const freeCols = []
      for (let j = 0; j < n; j++) {
        if (!pivotCols.includes(j)) {
          freeCols.push(j)
        }
      }

      // For each free variable, construct a null space vector
      const nullVectors = []
      for (const fc of freeCols) {
        const vec = new Array(n).fill(0)
        vec[fc] = 1 // free variable = 1

        // Pivot variables are determined by RREF rows
        for (let pi = 0; pi < pivotCols.length; pi++) {
          const pc = pivotCols[pi]
          // The pivot row is pi, and M[pi][fc] gives the coefficient
          vec[pc] = -M[pi][fc]
        }

        nullVectors.push(vec)
      }

      return nullVectors
    }
  }
)
