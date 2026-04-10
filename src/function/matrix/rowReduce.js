import { factory } from '../../utils/factory.js'

const name = 'rowReduce'
const dependencies = ['typed', 'matrix', 'simplify']

export const createRowReduce = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  matrix,
  simplify
}) => {
  /**
   * Compute the Reduced Row Echelon Form (RREF) of a matrix using Gauss-Jordan elimination.
   * Works for numeric matrices. For symbolic matrices, entries are treated as numeric
   * values if possible, otherwise an error is thrown.
   *
   * Syntax:
   *
   *     math.rowReduce(matrix)
   *
   * Examples:
   *
   *     math.rowReduce([[1, 2, 3], [4, 5, 6]])        // [[1, 0, -1], [0, 1, 2]]
   *     math.rowReduce([[2, 4], [1, 2]])               // [[1, 2], [0, 0]]
   *     math.rowReduce([[1, 0], [0, 1]])               // [[1, 0], [0, 1]]
   *
   * See also:
   *
   *     det, inv, lup, lusolve
   *
   * @param  {Array | Matrix}  mat  The input matrix (2D array or Matrix object)
   * @return {Array}                The RREF as a 2D array
   */
  return typed(name, {
    'Array | Matrix': function (mat) {
      // Convert Matrix to Array
      let data
      if (mat && typeof mat.toArray === 'function') {
        data = mat.toArray()
      } else {
        data = mat
      }

      if (!Array.isArray(data) || !Array.isArray(data[0])) {
        throw new Error('rowReduce: expected a 2D array or Matrix')
      }

      const rows = data.length
      const cols = data[0].length

      // Create a deep copy of the matrix as numbers
      const A = []
      for (let i = 0; i < rows; i++) {
        A.push([])
        for (let j = 0; j < cols; j++) {
          const val = data[i][j]
          if (typeof val === 'number') {
            A[i].push(val)
          } else if (val !== null && val !== undefined) {
            const n = Number(val)
            if (!isFinite(n)) {
              throw new Error('rowReduce: matrix entry at [' + i + ',' + j + '] is not numeric: ' + val)
            }
            A[i].push(n)
          } else {
            A[i].push(0)
          }
        }
      }

      // Gauss-Jordan elimination
      let pivotRow = 0
      const pivotCols = []

      for (let col = 0; col < cols && pivotRow < rows; col++) {
        // Find pivot: row with largest absolute value in this column (partial pivoting)
        let maxVal = Math.abs(A[pivotRow][col])
        let maxRow = pivotRow
        for (let row = pivotRow + 1; row < rows; row++) {
          if (Math.abs(A[row][col]) > maxVal) {
            maxVal = Math.abs(A[row][col])
            maxRow = row
          }
        }

        if (maxVal < 1e-10) continue // No pivot in this column

        // Swap rows
        if (maxRow !== pivotRow) {
          const temp = A[pivotRow]
          A[pivotRow] = A[maxRow]
          A[maxRow] = temp
        }

        pivotCols.push(col)

        // Scale pivot row so pivot element = 1
        const pivotVal = A[pivotRow][col]
        for (let j = 0; j < cols; j++) {
          A[pivotRow][j] /= pivotVal
        }

        // Eliminate all other rows
        for (let row = 0; row < rows; row++) {
          if (row === pivotRow) continue
          const factor = A[row][col]
          if (Math.abs(factor) < 1e-14) continue
          for (let j = 0; j < cols; j++) {
            A[row][j] -= factor * A[pivotRow][j]
          }
        }

        pivotRow++
      }

      // Clean up near-zero values
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.abs(A[i][j]) < 1e-10) A[i][j] = 0
          else if (Math.abs(A[i][j] - Math.round(A[i][j])) < 1e-10) A[i][j] = Math.round(A[i][j])
        }
      }

      return A
    }
  })
})
