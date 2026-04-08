import { factory } from '../../utils/factory.js'

const name = 'chiSquareTest'
const dependencies = ['typed']

export const createChiSquareTest = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a chi-squared goodness-of-fit test (1D arrays) or independence
     * test (2D contingency table).
     *
     * For 1D: chi2 = sum((O_i - E_i)^2 / E_i), df = length - 1
     * For 2D: expected cells auto-computed from row/column totals,
     *         df = (rows - 1) * (cols - 1)
     *
     * Returns an object with:
     *   - chiSquared: the test statistic
     *   - pValue: p-value (right tail)
     *   - df: degrees of freedom
     *
     * Syntax:
     *
     *     math.chiSquareTest(observed, expected)
     *     math.chiSquareTest(observed)
     *
     * Examples:
     *
     *     chiSquareTest([10, 20, 30], [20, 20, 20])
     *     chiSquareTest([[10, 20], [30, 40]])
     *
     * See also:
     *
     *     anova, studentTTest
     *
     * @param {Array} observed   1D or 2D array of observed counts
     * @param {Array} [expected] 1D array of expected counts (only for 1D case)
     * @return {Object}          Object with chiSquared, pValue, df
     */
    return typed(name, {
      'Array, Array': function (observed, expected) {
        // 1D goodness-of-fit
        if (!Array.isArray(observed) || observed.length < 1) {
          throw new Error('chiSquareTest: observed must be a non-empty array')
        }
        if (observed.length !== expected.length) {
          throw new Error('chiSquareTest: observed and expected must have the same length')
        }

        let chiSquared = 0
        for (let i = 0; i < observed.length; i++) {
          if (expected[i] <= 0) {
            throw new Error('chiSquareTest: all expected values must be positive')
          }
          const d = observed[i] - expected[i]
          chiSquared += (d * d) / expected[i]
        }

        const df = observed.length - 1
        const pValue = 1 - chiSquaredCDF(chiSquared, df)

        return { chiSquared, pValue, df }
      },

      Array: function (observed) {
        // 2D independence test
        if (!Array.isArray(observed) || observed.length < 2) {
          throw new Error('chiSquareTest: 2D observed must have at least 2 rows')
        }
        const rows = observed.length
        const cols = observed[0].length
        if (cols < 2) {
          throw new Error('chiSquareTest: 2D observed must have at least 2 columns')
        }

        // Compute row and column totals
        const rowTotals = new Array(rows).fill(0)
        const colTotals = new Array(cols).fill(0)
        let grandTotal = 0

        for (let i = 0; i < rows; i++) {
          if (observed[i].length !== cols) {
            throw new Error('chiSquareTest: all rows must have the same length')
          }
          for (let j = 0; j < cols; j++) {
            rowTotals[i] += observed[i][j]
            colTotals[j] += observed[i][j]
            grandTotal += observed[i][j]
          }
        }

        if (grandTotal === 0) {
          throw new Error('chiSquareTest: grand total must be positive')
        }

        // Compute chi-squared statistic
        let chiSquared = 0
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const expected = (rowTotals[i] * colTotals[j]) / grandTotal
            if (expected === 0) continue
            const d = observed[i][j] - expected
            chiSquared += (d * d) / expected
          }
        }

        const df = (rows - 1) * (cols - 1)
        const pValue = 1 - chiSquaredCDF(chiSquared, df)

        return { chiSquared, pValue, df }
      }
    })

    /**
     * CDF of the chi-squared distribution with df degrees of freedom.
     * Uses the regularized lower incomplete gamma function: P(df/2, x/2)
     * @param {number} x
     * @param {number} df
     * @return {number}
     */
    function chiSquaredCDF (x, df) {
      if (x <= 0) return 0
      return regularizedGammaLower(df / 2, x / 2)
    }

    /**
     * Regularized lower incomplete gamma function P(a, x)
     * Uses series expansion for x < a+1, continued fraction otherwise
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function regularizedGammaLower (a, x) {
      if (x < 0) return 0
      if (x === 0) return 0
      if (x < a + 1) {
        return gammaSeries(a, x)
      } else {
        return 1 - gammaContinuedFraction(a, x)
      }
    }

    /**
     * Series expansion for regularized lower incomplete gamma
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function gammaSeries (a, x) {
      const EPS = 3e-14
      const ITMAX = 200
      let ap = a
      let sum = 1 / a
      let del = sum
      for (let n = 1; n <= ITMAX; n++) {
        ap += 1
        del *= x / ap
        sum += del
        if (Math.abs(del) < Math.abs(sum) * EPS) break
      }
      return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
    }

    /**
     * Continued fraction for regularized upper incomplete gamma
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function gammaContinuedFraction (a, x) {
      const EPS = 3e-14
      const FPMIN = 1e-300
      const ITMAX = 200
      let b = x + 1 - a
      let c = 1 / FPMIN
      let d = 1 / b
      let h = d
      for (let i = 1; i <= ITMAX; i++) {
        const an = -i * (i - a)
        b += 2
        d = an * d + b
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = b + an / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del
        if (Math.abs(del - 1) < EPS) break
      }
      return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
    }

    /**
     * Log-gamma function using Lanczos approximation
     * @param {number} z
     * @return {number}
     */
    function logGamma (z) {
      if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
      }
      z -= 1
      const g = 7
      const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
      ]
      let x = c[0]
      for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i)
      }
      const t = z + g + 0.5
      return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
    }
  }
)
