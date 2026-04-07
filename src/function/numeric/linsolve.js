import { factory } from '../../utils/factory.js'

const name = 'linsolve'
const dependencies = ['typed']

export const createLinsolve = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Solve a linear system Ax = b using Gaussian elimination with partial pivoting.
     *
     * Syntax:
     *
     *    math.linsolve(A, b)
     *
     * Examples:
     *
     *    math.linsolve([[2, 1], [1, 3]], [5, 10])  // [1, 3]
     *    math.linsolve([[1, 0], [0, 1]], [4, 7])   // [4, 7]
     *
     * See also:
     *
     *    lsolve, lusolve, rank, nullspace
     *
     * @param {Array} A    Coefficient matrix (2D array, m x n)
     * @param {Array} b    Right-hand side vector (1D array, length m)
     * @return {Array}     Solution vector x
     */
    return typed(name, {
      'Array, Array': function (A, b) {
        return _gaussianElimination(A, b)
      }
    })

    function _gaussianElimination (A, b) {
      const n = A.length
      if (b.length !== n) {
        throw new Error('linsolve: A and b dimensions must be compatible')
      }

      // Create augmented matrix [A|b]
      const aug = A.map((row, i) => [...row, b[i]])

      for (let col = 0; col < n; col++) {
        // Partial pivoting: find row with largest absolute value in column
        let maxRow = col
        let maxVal = Math.abs(aug[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(aug[row][col]) > maxVal) {
            maxVal = Math.abs(aug[row][col])
            maxRow = row
          }
        }

        if (maxVal < 1e-15) {
          throw new Error('linsolve: matrix is singular or nearly singular')
        }

        // Swap rows
        if (maxRow !== col) {
          const tmp = aug[col]
          aug[col] = aug[maxRow]
          aug[maxRow] = tmp
        }

        // Eliminate below
        for (let row = col + 1; row < n; row++) {
          const factor = aug[row][col] / aug[col][col]
          for (let k = col; k <= n; k++) {
            aug[row][k] -= factor * aug[col][k]
          }
        }
      }

      // Back substitution
      const x = new Array(n).fill(0)
      for (let i = n - 1; i >= 0; i--) {
        x[i] = aug[i][n]
        for (let j = i + 1; j < n; j++) {
          x[i] -= aug[i][j] * x[j]
        }
        x[i] /= aug[i][i]
      }

      return x
    }
  }
)
