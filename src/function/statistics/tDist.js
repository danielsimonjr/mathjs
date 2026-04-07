import { factory } from '../../utils/factory.js'

const name = 'tDist'
const dependencies = ['typed']

export const createTDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a Student's t-distribution object with given degrees of freedom.
     * The t-distribution is used in statistical hypothesis testing.
     *
     * Returns an object with pdf, cdf, mean, and variance.
     *
     * Syntax:
     *
     *     math.tDist(df)
     *
     * Examples:
     *
     *     const d = math.tDist(10)
     *     d.pdf(0)    // returns 0.3891... (peak of the distribution)
     *     d.cdf(2.228) // returns ~0.975
     *     d.mean      // returns 0 (for df > 1)
     *     d.variance  // returns 1.25 (for df = 10)
     *
     * See also:
     *
     *     normalDist, chiSquaredDist
     *
     * @param {number} df   Degrees of freedom (must be positive)
     * @return {Object}     Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      number: function (df) {
        if (df <= 0) {
          throw new Error('tDist: degrees of freedom must be positive')
        }

        // Normalization constant: Gamma((df+1)/2) / (sqrt(df*pi) * Gamma(df/2))
        const logNorm = logGamma((df + 1) / 2) - 0.5 * Math.log(df * Math.PI) - logGamma(df / 2)
        const norm = Math.exp(logNorm)

        return {
          pdf: function (x) {
            return norm * Math.pow(1 + x * x / df, -(df + 1) / 2)
          },
          cdf: function (x) {
            // CDF via regularized incomplete beta function
            // P(T <= x) = I(df/(df+x^2), df/2, 1/2) / 2  for x < 0
            //           = 1 - I(df/(df+x^2), df/2, 1/2) / 2  for x >= 0
            const z = df / (df + x * x)
            const ibeta = regularizedIncompleteBeta(z, df / 2, 0.5)
            if (x < 0) {
              return ibeta / 2
            } else {
              return 1 - ibeta / 2
            }
          },
          mean: df > 1 ? 0 : undefined,
          variance: df > 2 ? df / (df - 2) : (df > 1 ? Infinity : undefined)
        }
      }
    })

    /**
     * Log of the gamma function using Lanczos approximation
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

    /**
     * Regularized incomplete beta function I_x(a, b)
     * Uses continued fraction expansion (Lentz's method)
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function regularizedIncompleteBeta (x, a, b) {
      if (x === 0) return 0
      if (x === 1) return 1

      // Use symmetry relation if needed for better convergence
      if (x > (a + 1) / (a + b + 2)) {
        return 1 - regularizedIncompleteBeta(1 - x, b, a)
      }

      const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b)
      const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a

      return front * betaCF(x, a, b)
    }

    /**
     * Continued fraction for incomplete beta function (Lentz's algorithm)
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function betaCF (x, a, b) {
      const MAXIT = 200
      const EPS = 3e-14
      const FPMIN = 1e-300

      const qab = a + b
      const qap = a + 1
      const qam = a - 1

      let c = 1
      let d = 1 - qab * x / qap
      if (Math.abs(d) < FPMIN) d = FPMIN
      d = 1 / d
      let h = d

      for (let m = 1; m <= MAXIT; m++) {
        const m2 = 2 * m
        // Even step
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        h *= d * c

        // Odd step
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del

        if (Math.abs(del - 1) < EPS) break
      }

      return h
    }
  }
)
