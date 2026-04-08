import { factory } from '../../utils/factory.js'

const name = 'anova'
const dependencies = ['typed']

export const createAnova = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a one-way ANOVA (Analysis of Variance) F-test comparing means
     * across multiple groups. Tests whether the group means are all equal.
     *
     * F = MSB / MSW where:
     *   MSB = between-group mean square (explained variance)
     *   MSW = within-group mean square (unexplained variance)
     *
     * Returns an object with:
     *   - F: the F-statistic
     *   - pValue: p-value from the F-distribution
     *   - dfBetween: degrees of freedom between groups (k-1)
     *   - dfWithin: degrees of freedom within groups (N-k)
     *
     * Syntax:
     *
     *     math.anova(groups)
     *
     * Examples:
     *
     *     anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
     *     anova([[2, 3, 4], [2, 3, 4]])
     *
     * See also:
     *
     *     mean, variance, std, studentTTest
     *
     * @param {Array} groups   Array of arrays, each inner array is one group
     * @return {Object}        Object with F, pValue, dfBetween, dfWithin
     */
    return typed(name, {
      Array: function (groups) {
        if (!Array.isArray(groups) || groups.length < 2) {
          throw new Error('anova: groups must be an array of at least 2 groups')
        }
        for (let i = 0; i < groups.length; i++) {
          if (!Array.isArray(groups[i]) || groups[i].length < 1) {
            throw new Error('anova: each group must be a non-empty array')
          }
        }

        const k = groups.length
        let N = 0
        const groupMeans = []
        const groupSizes = []

        // Compute group means and sizes
        for (let i = 0; i < k; i++) {
          const g = groups[i]
          const n = g.length
          let s = 0
          for (let j = 0; j < n; j++) s += g[j]
          groupMeans.push(s / n)
          groupSizes.push(n)
          N += n
        }

        // Grand mean
        let grandSum = 0
        for (let i = 0; i < k; i++) {
          grandSum += groupMeans[i] * groupSizes[i]
        }
        const grandMean = grandSum / N

        // Between-group sum of squares (SSB)
        let SSB = 0
        for (let i = 0; i < k; i++) {
          const d = groupMeans[i] - grandMean
          SSB += groupSizes[i] * d * d
        }

        // Within-group sum of squares (SSW)
        let SSW = 0
        for (let i = 0; i < k; i++) {
          const g = groups[i]
          const m = groupMeans[i]
          for (let j = 0; j < g.length; j++) {
            const d = g[j] - m
            SSW += d * d
          }
        }

        const dfBetween = k - 1
        const dfWithin = N - k

        if (dfWithin <= 0) {
          throw new Error('anova: not enough observations for within-group degrees of freedom')
        }

        const MSB = SSB / dfBetween
        const MSW = SSW / dfWithin

        if (MSW === 0) {
          // All within-group variance is zero
          if (MSB === 0) {
            return { F: NaN, pValue: 1, dfBetween, dfWithin }
          }
          return { F: Infinity, pValue: 0, dfBetween, dfWithin }
        }

        const F = MSB / MSW

        // p-value = 1 - CDF_F(F, dfBetween, dfWithin)
        // CDF of F-dist: I_{x}(d1/2, d2/2) where x = d1*F/(d1*F + d2)
        const d1 = dfBetween
        const d2 = dfWithin
        const x = (d1 * F) / (d1 * F + d2)
        const pValue = 1 - regularizedBeta(x, d1 / 2, d2 / 2)

        return { F, pValue, dfBetween, dfWithin }
      }
    })

    /**
     * Regularized incomplete beta function I_x(a, b)
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function regularizedBeta (x, a, b) {
      if (x <= 0) return 0
      if (x >= 1) return 1
      if (x > (a + 1) / (a + b + 2)) {
        return 1 - regularizedBeta(1 - x, b, a)
      }
      const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b)
      const lbx = a * Math.log(x) + b * Math.log(1 - x) - lbeta - Math.log(a)
      const FPMIN = 1e-300
      const qab = a + b
      const qap = a + 1
      const qam = a - 1
      let c = 1
      let d = 1 - qab * x / qap
      if (Math.abs(d) < FPMIN) d = FPMIN
      d = 1 / d
      let h = d
      for (let m = 1; m <= 200; m++) {
        const m2 = 2 * m
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const delta = d * c
        h *= delta
        if (Math.abs(delta - 1) < 3e-14) break
      }
      return Math.exp(lbx) * h
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
