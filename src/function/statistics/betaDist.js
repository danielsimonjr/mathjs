import { factory } from '../../utils/factory.js'

const name = 'betaDist'
const dependencies = ['typed']

export const createBetaDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a Beta distribution object with shape parameters alpha and beta.
     * Returns an object with pdf, cdf methods and mean, variance properties.
     *
     * Syntax:
     *
     *     math.betaDist(alpha, beta)
     *
     * Examples:
     *
     *     const d = math.betaDist(2, 5)
     *     d.pdf(0.3)   // returns ~1.8522
     *     d.cdf(0.3)   // returns ~0.4202
     *     d.mean       // returns ~0.2857
     *     d.variance   // returns ~0.0255
     *
     * See also:
     *
     *     gammaDist, fDist, normalDist
     *
     * @param {number} alpha  First shape parameter (must be positive)
     * @param {number} beta   Second shape parameter (must be positive)
     * @return {Object}       Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      'number, number': function (alpha, beta) {
        if (alpha <= 0) {
          throw new Error('betaDist: alpha must be positive')
        }
        if (beta <= 0) {
          throw new Error('betaDist: beta must be positive')
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
        const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta)

        // Regularized incomplete beta function I_x(a, b) using continued fraction
        const regularizedBeta = function (x, a, b) {
          if (x <= 0) return 0
          if (x >= 1) return 1

          // Use symmetry relation for better convergence
          if (x > (a + 1) / (a + b + 2)) {
            return 1 - regularizedBeta(1 - x, b, a)
          }

          // Continued fraction (Lentz's method)
          const lbeta = Math.log(x) * a + Math.log(1 - x) * b - logBeta - Math.log(a)
          let fpmin = 1e-300
          let qab = a + b
          let qap = a + 1
          let qam = a - 1
          let c = 1
          let d = 1 - qab * x / qap
          if (Math.abs(d) < fpmin) d = fpmin
          d = 1 / d
          let h = d

          for (let m = 1; m <= 200; m++) {
            const m2 = 2 * m
            // Even step
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
            d = 1 + aa * d
            if (Math.abs(d) < fpmin) d = fpmin
            c = 1 + aa / c
            if (Math.abs(c) < fpmin) c = fpmin
            d = 1 / d
            h *= d * c
            // Odd step
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

          return Math.exp(lbeta) * h
        }

        return {
          pdf: function (x) {
            if (x <= 0 || x >= 1) return 0
            return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta)
          },
          cdf: function (x) {
            if (x <= 0) return 0
            if (x >= 1) return 1
            return regularizedBeta(x, alpha, beta)
          },
          mean: alpha / (alpha + beta),
          variance: (alpha * beta) / ((alpha + beta) * (alpha + beta) * (alpha + beta + 1))
        }
      }
    })
  }
)
