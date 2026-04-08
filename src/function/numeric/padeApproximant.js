import { factory } from '../../utils/factory.js'

const name = 'padeApproximant'
const dependencies = ['typed']

export const createPadeApproximant = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the [m/n] Padé approximant from Taylor series coefficients.
     *
     * Given coefficients c[0], c[1], ..., c[m+n] of a Taylor series
     *   f(x) = c[0] + c[1]*x + c[2]*x^2 + ...
     * computes the rational approximation P(x)/Q(x) where P has degree m
     * and Q has degree n, normalized so that Q(0) = 1.
     *
     * Syntax:
     *
     *    math.padeApproximant(coeffs, m, n)
     *
     * Examples:
     *
     *    // exp(x) Taylor coefficients: 1, 1, 1/2, 1/6, 1/24, ...
     *    const e = math.padeApproximant([1, 1, 0.5, 1/6, 1/24, 1/120], 2, 2)
     *    e.evaluate(1)    // approximation to exp(1) = e
     *    e.evaluate(0.5)  // approximation to exp(0.5)
     *
     * See also:
     *
     *    chebyshevApprox, polyfit
     *
     * @param {Array}  coeffs  Taylor series coefficients [c0, c1, c2, ...]
     *                         Must have at least m+n+1 entries.
     * @param {number} m       Degree of numerator polynomial
     * @param {number} n       Degree of denominator polynomial
     * @return {Object}  Object with `numerator`, `denominator`, and `evaluate(x)` fields
     */
    return typed(name, {
      'Array, number, number': function (coeffs, m, n) {
        return _pade(coeffs, m, n)
      }
    })

    function _pade (c, m, n) {
      if (m < 0 || n < 0) {
        throw new Error('padeApproximant: m and n must be non-negative integers')
      }
      if (!Number.isInteger(m) || !Number.isInteger(n)) {
        throw new Error('padeApproximant: m and n must be integers')
      }
      if (c.length < m + n + 1) {
        throw new Error(
          'padeApproximant: need at least m+n+1=' + (m + n + 1) +
          ' coefficients, got ' + c.length
        )
      }

      // Build linear system for denominator coefficients q[1..n]
      // From the matching condition: sum_{j=0}^{m+n} c[j] x^j ≡ P(x)/Q(x) mod x^{m+n+1}
      // P(x) = sum_{i=0}^{m} p[i] x^i,  Q(x) = 1 + sum_{j=1}^{n} q[j] x^j
      //
      // Q(x)*f(x) ≡ P(x) mod x^{m+n+1}
      // For k = m+1, ..., m+n: sum_{j=1}^{min(k,n)} q[j] * c[k-j] + c[k] = 0

      if (n > 0) {
        // Build n x n system for q[1..n]
        const A = []
        const b = []
        for (let k = m + 1; k <= m + n; k++) {
          const row = new Array(n).fill(0)
          for (let j = 1; j <= n; j++) {
            const idx = k - j
            row[j - 1] = idx >= 0 ? c[idx] : 0
          }
          A.push(row)
          b.push(-(c[k] || 0))
        }

        const q = _solveLinear(A, b)

        // Compute numerator coefficients p[0..m]
        // p[k] = sum_{j=0}^{min(k,n)} q[j] * c[k-j]  for k = 0..m, with q[0] = 1
        const qFull = [1].concat(q)
        const p = new Array(m + 1).fill(0)
        for (let k = 0; k <= m; k++) {
          for (let j = 0; j <= Math.min(k, n); j++) {
            p[k] += (qFull[j] || 0) * (c[k - j] || 0)
          }
        }

        const denominator = qFull

        return {
          numerator: p,
          denominator,
          evaluate: function (x) {
            const num = _polyEval(p, x)
            const den = _polyEval(denominator, x)
            if (Math.abs(den) < 1e-300) {
              throw new Error('padeApproximant.evaluate: denominator is zero at x=' + x)
            }
            return num / den
          }
        }
      } else {
        // n=0: pure polynomial, just truncate Taylor series
        const p = c.slice(0, m + 1)
        return {
          numerator: p,
          denominator: [1],
          evaluate: function (x) {
            return _polyEval(p, x)
          }
        }
      }
    }

    function _polyEval (coeffs, x) {
      // Horner's method
      let result = 0
      for (let i = coeffs.length - 1; i >= 0; i--) {
        result = result * x + coeffs[i]
      }
      return result
    }

    function _solveLinear (A, b) {
      const n = A.length
      if (n === 0) return []

      // Build augmented matrix
      const M = A.map((row, i) => row.slice().concat([b[i]]))

      for (let col = 0; col < n; col++) {
        // Partial pivoting
        let maxRow = col
        let maxVal = Math.abs(M[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(M[row][col]) > maxVal) {
            maxVal = Math.abs(M[row][col])
            maxRow = row
          }
        }
        const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp

        if (Math.abs(M[col][col]) < 1e-14) {
          throw new Error('padeApproximant: system is singular; check coefficients and m, n values')
        }

        const pivot = M[col][col]
        for (let j = col; j <= n; j++) {
          M[col][j] /= pivot
        }
        for (let row = 0; row < n; row++) {
          if (row !== col) {
            const factor = M[row][col]
            for (let j = col; j <= n; j++) {
              M[row][j] -= factor * M[col][j]
            }
          }
        }
      }

      return M.map(row => row[n])
    }
  }
)
