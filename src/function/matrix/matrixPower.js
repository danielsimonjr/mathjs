import { factory } from '../../utils/factory.js'

const name = 'matrixPower'
const dependencies = ['typed', 'multiply', 'inv', 'identity', 'matrix', 'size']

export const createMatrixPower = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, multiply, inv, identity, matrix, size }) => {
    /**
     * Raise a square matrix A to an integer power n.
     *
     * - For n > 0: uses repeated squaring (binary exponentiation)
     * - For n = 0: returns the identity matrix
     * - For n < 0: returns inv(A)^|n|
     *
     * Syntax:
     *
     *     math.matrixPower(A, n)
     *
     * Examples:
     *
     *     math.matrixPower([[1, 1], [0, 1]], 3)
     *     // Returns [[1, 3], [0, 1]]
     *
     *     math.matrixPower([[2, 0], [0, 3]], 2)
     *     // Returns [[4, 0], [0, 9]]
     *
     *     math.matrixPower([[1, 0], [0, 1]], 0)
     *     // Returns [[1, 0], [0, 1]]
     *
     * See also:
     *
     *     multiply, inv, det, eigs
     *
     * @param {Array | Matrix} A  A square matrix
     * @param {number} n          An integer exponent
     * @return {Array | Matrix}   A^n
     */
    return typed(name, {
      'Array, number': function (A, n) {
        return _matrixPower(A, n)
      },

      'Matrix, number': function (A, n) {
        return matrix(_matrixPower(A.toArray(), n))
      }
    })

    function _matrixPower (A, n) {
      if (!Number.isInteger(n)) {
        throw new Error('matrixPower: exponent must be an integer, got ' + n)
      }

      const rows = A.length
      for (let i = 0; i < rows; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== rows) {
          throw new Error('matrixPower: matrix must be square')
        }
      }

      // Identity matrix helper
      const makeIdentity = (n) => {
        const I = []
        for (let i = 0; i < n; i++) {
          I.push(new Array(n).fill(0))
          I[i][i] = 1
        }
        return I
      }

      if (n === 0) {
        return makeIdentity(rows)
      }

      let base = A
      let exp = Math.abs(n)

      // If negative, invert the base matrix
      if (n < 0) {
        base = inv(A)
        if (!Array.isArray(base)) {
          base = base.toArray()
        }
      }

      // Binary exponentiation (repeated squaring)
      let result = makeIdentity(rows)
      let curr = base.map(row => [...row]) // copy

      while (exp > 0) {
        if (exp % 2 === 1) {
          const prod = multiply(result, curr)
          result = Array.isArray(prod) ? prod : prod.toArray()
        }
        const sq = multiply(curr, curr)
        curr = Array.isArray(sq) ? sq : sq.toArray()
        exp = Math.floor(exp / 2)
      }

      return result
    }
  }
)
