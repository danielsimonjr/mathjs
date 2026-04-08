import { factory } from '../../utils/factory.js'

const name = 'kolmogorovSmirnovTest'
const dependencies = ['typed']

export const createKolmogorovSmirnovTest = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a Kolmogorov-Smirnov test.
     *
     * One-sample: compare a sample's ECDF to a theoretical CDF function.
     *   D = max |F_n(x) - F(x)|
     *   Call: kolmogorovSmirnovTest(sample, cdfFn) where cdfFn is a function
     *
     * Two-sample: compare two sample ECDFs.
     *   D = max |F_n1(x) - F_n2(x)|
     *   Call: kolmogorovSmirnovTest(sample1, sample2) where both are arrays
     *
     * p-value is computed from the KS distribution.
     *
     * Returns an object with:
     *   - D: the KS statistic
     *   - pValue: the p-value
     *
     * Syntax:
     *
     *     math.kolmogorovSmirnovTest(sample, cdfFn)
     *     math.kolmogorovSmirnovTest(sample1, sample2)
     *
     * Examples:
     *
     *     kolmogorovSmirnovTest([1, 2, 3, 4, 5], x => x / 5)
     *     kolmogorovSmirnovTest([1, 2, 3], [1, 2, 4])
     *
     * See also:
     *
     *     anova, chiSquareTest, shapiroWilkTest
     *
     * @param {Array} sample       First sample (or only sample for one-sample test)
     * @param {Array|Function} distOrSample  CDF function or second sample array
     * @return {Object}            Object with D (KS statistic) and pValue
     */
    return typed(name, {
      'Array, Array': function (sample1, sample2) {
        // Two-sample KS test
        if (sample1.length < 1 || sample2.length < 1) {
          throw new Error('kolmogorovSmirnovTest: both samples must be non-empty')
        }

        const s1 = sample1.slice().sort((a, b) => a - b)
        const s2 = sample2.slice().sort((a, b) => a - b)
        const n1 = s1.length
        const n2 = s2.length

        // Merge all values and compute ECDFs
        const allVals = s1.concat(s2).sort((a, b) => a - b)
        let D = 0

        for (const v of allVals) {
          const ecdf1 = s1.filter(x => x <= v).length / n1
          const ecdf2 = s2.filter(x => x <= v).length / n2
          const diff = Math.abs(ecdf1 - ecdf2)
          if (diff > D) D = diff
        }

        // Effective sample size for two-sample KS
        const nEff = Math.sqrt((n1 * n2) / (n1 + n2))
        const pValue = ksPValue(D * nEff)

        return { D, pValue }
      },

      'Array, function': function (sample, cdf) {
        // One-sample KS test against theoretical CDF
        if (sample.length < 1) {
          throw new Error('kolmogorovSmirnovTest: sample must be non-empty')
        }

        const sorted = sample.slice().sort((a, b) => a - b)
        const n = sorted.length
        let D = 0

        for (let i = 0; i < n; i++) {
          const x = sorted[i]
          const ecdf = (i + 1) / n
          const ecdfPrev = i / n
          const theoretical = cdf(x)
          const diffAfter = Math.abs(ecdf - theoretical)
          const diffBefore = Math.abs(ecdfPrev - theoretical)
          if (diffAfter > D) D = diffAfter
          if (diffBefore > D) D = diffBefore
        }

        const sqrtN = Math.sqrt(n)
        const pValue = ksPValue(D * sqrtN)

        return { D, pValue }
      }
    })

    /**
     * Approximate p-value for the KS test using the KS distribution.
     * P(K <= z) ≈ 1 - 2 * sum_{k=1}^{inf} (-1)^{k-1} * exp(-2*k^2*z^2)
     * p-value = 1 - P(K <= z)
     * @param {number} z  D * sqrt(n) or D * sqrt(n_eff)
     * @return {number}
     */
    function ksPValue (z) {
      if (z <= 0) return 1
      if (z > 3.5) return 0

      // Kolmogorov distribution: p = 2 * sum_{k=1}^{inf} (-1)^{k-1} exp(-2 k^2 z^2)
      let sum = 0
      for (let k = 1; k <= 200; k++) {
        const term = Math.exp(-2 * k * k * z * z)
        const sign = k % 2 === 1 ? 1 : -1
        sum += sign * term
        if (Math.abs(term) < 1e-15) break
      }
      const pValue = 2 * sum
      return Math.max(0, Math.min(1, pValue))
    }
  }
)
