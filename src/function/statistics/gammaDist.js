import { factory } from '../../utils/factory.js'

const name = 'gammaDist'
const dependencies = ['typed']

export const createGammaDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a Gamma distribution object with shape k and rate beta.
     * Returns an object with pdf, cdf methods and mean, variance properties.
     *
     * Syntax:
     *
     *     math.gammaDist(k, beta)
     *
     * Examples:
     *
     *     const d = math.gammaDist(2, 1)
     *     d.pdf(1)    // returns ~0.3679
     *     d.cdf(1)    // returns ~0.2642
     *     d.mean      // returns 2
     *     d.variance  // returns 2
     *
     * See also:
     *
     *     exponentialDist, betaDist, chiSquaredDist
     *
     * @param {number} k     Shape parameter (must be positive)
     * @param {number} beta  Rate parameter (must be positive)
     * @return {Object}      Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      'number, number': function (k, beta) {
        if (k <= 0) {
          throw new Error('gammaDist: shape k must be positive')
        }
        if (beta <= 0) {
          throw new Error('gammaDist: rate beta must be positive')
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

        const logGammaK = logGamma(k)

        // Regularized lower incomplete gamma using series expansion
        // P(k, x) = e^(-x) * x^k / Gamma(k) * sum_{n=0}^{inf} x^n / (k*(k+1)*...*(k+n))
        const regularizedGammaP = function (a, x) {
          if (x < 0) return 0
          if (x === 0) return 0
          if (x < a + 1) {
            // Series expansion
            let sum = 1 / a
            let term = 1 / a
            for (let n = 1; n < 200; n++) {
              term *= x / (a + n)
              sum += term
              if (Math.abs(term) < Math.abs(sum) * 1e-12) break
            }
            return Math.exp(-x + a * Math.log(x) - logGamma(a)) * sum
          } else {
            // Continued fraction (Lentz's method)
            let fpmin = 1e-300
            let b = x + 1 - a
            let c = 1 / fpmin
            let d = 1 / b
            let h = d
            for (let i = 1; i <= 200; i++) {
              const an = -i * (i - a)
              b += 2
              d = an * d + b
              if (Math.abs(d) < fpmin) d = fpmin
              c = b + an / c
              if (Math.abs(c) < fpmin) c = fpmin
              d = 1 / d
              const delta = d * c
              h *= delta
              if (Math.abs(delta - 1) < 1e-12) break
            }
            return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
          }
        }

        return {
          pdf: function (x) {
            if (x <= 0) return 0
            return Math.exp((k - 1) * Math.log(x) - beta * x + k * Math.log(beta) - logGammaK)
          },
          cdf: function (x) {
            if (x <= 0) return 0
            return regularizedGammaP(k, beta * x)
          },
          mean: k / beta,
          variance: k / (beta * beta)
        }
      }
    })
  }
)
