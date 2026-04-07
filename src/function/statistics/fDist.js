import { factory } from '../../utils/factory.js'

const name = 'fDist'
const dependencies = ['typed']

export const createFDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create an F-distribution object with degrees of freedom df1 and df2.
     * Returns an object with pdf, cdf methods and mean, variance properties.
     *
     * Syntax:
     *
     *     math.fDist(df1, df2)
     *
     * Examples:
     *
     *     const d = math.fDist(5, 10)
     *     d.pdf(1)    // returns ~0.4506
     *     d.cdf(1)    // returns ~0.5008
     *     d.mean      // returns 1.25
     *     d.variance  // returns ~1.3542
     *
     * See also:
     *
     *     tDist, chiSquaredDist, betaDist
     *
     * @param {number} df1  Numerator degrees of freedom (must be positive)
     * @param {number} df2  Denominator degrees of freedom (must be positive)
     * @return {Object}     Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      'number, number': function (df1, df2) {
        if (df1 <= 0) {
          throw new Error('fDist: df1 must be positive')
        }
        if (df2 <= 0) {
          throw new Error('fDist: df2 must be positive')
        }

        // Log of gamma function using Lanczos approximation
        const logGamma = function (z) {
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
          if (z < 0.5) {
            return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
          }
          z -= 1
          let x = c[0]
          for (let i = 1; i < g + 2; i++) {
            x += c[i] / (z + i)
          }
          const t = z + g + 0.5
          return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
        }

        // Log of beta function B(a, b) = Gamma(a)*Gamma(b)/Gamma(a+b)
        const logBeta = function (a, b) {
          return logGamma(a) + logGamma(b) - logGamma(a + b)
        }

        const lbeta = logBeta(df1 / 2, df2 / 2)

        // Regularized incomplete beta function I_x(a, b) using continued fraction
        const regularizedBeta = function (x, a, b) {
          if (x <= 0) return 0
          if (x >= 1) return 1

          // Use symmetry relation for better convergence
          if (x > (a + 1) / (a + b + 2)) {
            return 1 - regularizedBeta(1 - x, b, a)
          }

          const lb = logGamma(a) + logGamma(b) - logGamma(a + b)
          const lbx = Math.log(x) * a + Math.log(1 - x) * b - lb - Math.log(a)
          let fpmin = 1e-300
          let qap = a + 1
          let qam = a - 1
          let qab = a + b
          let c = 1
          let d = 1 - qab * x / qap
          if (Math.abs(d) < fpmin) d = fpmin
          d = 1 / d
          let h = d

          for (let m = 1; m <= 200; m++) {
            const m2 = 2 * m
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
            d = 1 + aa * d
            if (Math.abs(d) < fpmin) d = fpmin
            c = 1 + aa / c
            if (Math.abs(c) < fpmin) c = fpmin
            d = 1 / d
            h *= d * c
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
            d = 1 + aa * d
            if (Math.abs(d) < fpmin) d = fpmin
            c = 1 + aa / c
            if (Math.abs(c) < fpmin) c = fpmin
            d = 1 / d
            const delta = d * c
            h *= delta
            if (Math.abs(delta - 1) < 1e-12) break
          }

          return Math.exp(lbx) * h
        }

        const d1 = df1
        const d2 = df2

        return {
          pdf: function (x) {
            if (x <= 0) return 0
            // pdf = sqrt((d1*x)^d1 * d2^d2 / (d1*x+d2)^(d1+d2)) / (x * B(d1/2, d2/2))
            const logPdf =
              0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) -
              Math.log(x) - lbeta
            return Math.exp(logPdf)
          },
          cdf: function (x) {
            if (x <= 0) return 0
            const t = (d1 * x) / (d1 * x + d2)
            return regularizedBeta(t, d1 / 2, d2 / 2)
          },
          mean: df2 > 2 ? d2 / (d2 - 2) : NaN,
          variance: df2 > 4
            ? (2 * d2 * d2 * (d1 + d2 - 2)) / (d1 * (d2 - 2) * (d2 - 2) * (d2 - 4))
            : NaN
        }
      }
    })
  }
)
