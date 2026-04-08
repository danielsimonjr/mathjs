import { factory } from '../../utils/factory.js'

const name = 'mannWhitneyTest'
const dependencies = ['typed']

export const createMannWhitneyTest = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a Mann-Whitney U test (also known as the Wilcoxon rank-sum test).
     * This is a non-parametric test for whether two samples come from the same
     * distribution.
     *
     * All values from both samples are ranked together. Ties receive average ranks.
     * U = n1*n2 + n1*(n1+1)/2 - R1, where R1 is the sum of ranks for sample1.
     * For n1+n2 > 20, a normal approximation is used for the p-value.
     *
     * Returns an object with:
     *   - U: the U statistic (minimum of U1 and U2)
     *   - pValue: two-tailed p-value
     *
     * Syntax:
     *
     *     math.mannWhitneyTest(sample1, sample2)
     *
     * Examples:
     *
     *     mannWhitneyTest([1, 2, 3, 4], [5, 6, 7, 8])
     *     mannWhitneyTest([1, 2, 3], [2, 3, 4])
     *
     * See also:
     *
     *     studentTTest, anova, shapiroWilkTest
     *
     * @param {Array} sample1  First sample (array of numbers)
     * @param {Array} sample2  Second sample (array of numbers)
     * @return {Object}        Object with U and pValue
     */
    return typed(name, {
      'Array, Array': function (sample1, sample2) {
        if (sample1.length < 1) {
          throw new Error('mannWhitneyTest: sample1 must be non-empty')
        }
        if (sample2.length < 1) {
          throw new Error('mannWhitneyTest: sample2 must be non-empty')
        }

        const n1 = sample1.length
        const n2 = sample2.length
        const N = n1 + n2

        // Combine samples with group labels
        const combined = []
        for (let i = 0; i < n1; i++) combined.push({ value: sample1[i], group: 1 })
        for (let i = 0; i < n2; i++) combined.push({ value: sample2[i], group: 2 })
        combined.sort((a, b) => a.value - b.value)

        // Assign ranks with tie correction (average ranks for ties)
        const ranks = new Array(N)
        let i = 0
        while (i < N) {
          let j = i
          while (j < N && combined[j].value === combined[i].value) j++
          const avgRank = (i + 1 + j) / 2
          for (let k = i; k < j; k++) ranks[k] = avgRank
          i = j
        }

        // Sum of ranks for sample 1
        let R1 = 0
        for (let k = 0; k < N; k++) {
          if (combined[k].group === 1) R1 += ranks[k]
        }

        const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - R1
        const U2 = n1 * n2 - U1
        const U = Math.min(U1, U2)

        // p-value using normal approximation
        // Mean and variance of U under H0
        const muU = (n1 * n2) / 2

        // Tie correction for variance
        // sigma^2 = n1*n2/12 * (N+1 - sum_t(t^3-t)/(N*(N-1)))
        // Compute tie correction term
        let tieCorrection = 0
        i = 0
        while (i < N) {
          let j = i
          while (j < N && combined[j].value === combined[i].value) j++
          const t = j - i
          if (t > 1) {
            tieCorrection += (t * t * t - t)
          }
          i = j
        }

        const sigmaUSq = (n1 * n2 / 12) * (N + 1 - tieCorrection / (N * (N - 1)))
        const sigmaU = Math.sqrt(sigmaUSq)

        let pValue
        if (sigmaU === 0) {
          pValue = U1 === muU ? 1 : 0
        } else {
          // Continuity correction: z = (U - muU - 0.5) / sigmaU
          const z = (U - muU) / sigmaU
          // Two-tailed p-value using standard normal CDF
          pValue = 2 * normalCDF(-Math.abs(z))
        }

        return { U, pValue }
      }
    })

    /**
     * Standard normal CDF using the error function approximation
     * @param {number} x
     * @return {number}
     */
    function normalCDF (x) {
      return 0.5 * (1 + erf(x / Math.SQRT2))
    }

    /**
     * Error function approximation (Horner form, max error ~1.5e-7)
     * @param {number} x
     * @return {number}
     */
    function erf (x) {
      const t = 1 / (1 + 0.3275911 * Math.abs(x))
      const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
      const result = 1 - poly * Math.exp(-x * x)
      return x >= 0 ? result : -result
    }
  }
)
