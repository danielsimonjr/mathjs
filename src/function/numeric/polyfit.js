import { factory } from '../../utils/factory.js'

const name = 'polyfit'
const dependencies = ['typed']

export const createPolyfit = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Fit a polynomial of the given degree to a set of data points using
     * least-squares regression (normal equations with a Vandermonde matrix).
     *
     * Returns coefficients [c0, c1, c2, ...] such that:
     *   p(x) = c0 + c1*x + c2*x^2 + ... + cdegree*x^degree
     *
     * Syntax:
     *
     *    math.polyfit(x, y, degree)
     *
     * Examples:
     *
     *    math.polyfit([0, 1, 2, 3], [0, 1, 4, 9], 2)   // [0, 0, 1]  (x^2)
     *    math.polyfit([0, 1, 2], [1, 2, 3], 1)          // [1, 1]     (1 + x)
     *
     * See also:
     *
     *    interpolate, curvefit, expfit, powerfit, logfit
     *
     * @param {Array} x       Array of x-coordinates
     * @param {Array} y       Array of y-coordinates (same length as x)
     * @param {number} degree Degree of the polynomial to fit
     * @return {Array}        Coefficients [c0, c1, ..., cdegree]
     */
    return typed(name, {
      'Array, Array, number': function (x, y, degree) {
        return _polyfit(x, y, degree)
      }
    })

    function _polyfit (x, y, degree) {
      const n = x.length
      const m = degree + 1

      if (n !== y.length) {
        throw new Error('polyfit: x and y must have the same length')
      }
      if (n < m) {
        throw new Error('polyfit: not enough data points for degree ' + degree)
      }

      // Build Vandermonde matrix V (n x m): V[i][j] = x[i]^j
      const V = []
      for (let i = 0; i < n; i++) {
        const row = []
        let xpow = 1
        for (let j = 0; j < m; j++) {
          row.push(xpow)
          xpow *= x[i]
        }
        V.push(row)
      }

      // Compute A = V^T * V  (m x m)
      const A = []
      for (let r = 0; r < m; r++) {
        const row = []
        for (let c = 0; c < m; c++) {
          let sum = 0
          for (let i = 0; i < n; i++) sum += V[i][r] * V[i][c]
          row.push(sum)
        }
        A.push(row)
      }

      // Compute b = V^T * y  (m x 1)
      const b = []
      for (let r = 0; r < m; r++) {
        let sum = 0
        for (let i = 0; i < n; i++) sum += V[i][r] * y[i]
        b.push(sum)
      }

      // Solve A * c = b via Gaussian elimination with partial pivoting
      return _gaussianSolve(A, b)
    }

    function _gaussianSolve (A, b) {
      const m = b.length
      // Augment: [A | b]
      const M = A.map((row, i) => [...row, b[i]])

      for (let col = 0; col < m; col++) {
        // Partial pivot
        let maxRow = col
        for (let row = col + 1; row < m; row++) {
          if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
        }
        const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp

        if (Math.abs(M[col][col]) < 1e-14) {
          throw new Error('polyfit: singular matrix — try a lower degree')
        }

        for (let row = col + 1; row < m; row++) {
          const factor = M[row][col] / M[col][col]
          for (let k = col; k <= m; k++) {
            M[row][k] -= factor * M[col][k]
          }
        }
      }

      // Back substitution
      const x = new Array(m).fill(0)
      for (let i = m - 1; i >= 0; i--) {
        x[i] = M[i][m]
        for (let j = i + 1; j < m; j++) x[i] -= M[i][j] * x[j]
        x[i] /= M[i][i]
      }
      return x
    }
  }
)
