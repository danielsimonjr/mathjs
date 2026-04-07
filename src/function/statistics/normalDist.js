import { factory } from '../../utils/factory.js'

const name = 'normalDist'
const dependencies = ['typed']

export const createNormalDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a normal (Gaussian) distribution object with given mean and
     * standard deviation. Returns an object with pdf, cdf, icdf methods.
     *
     * Syntax:
     *
     *     math.normalDist(mu, sigma)
     *
     * Examples:
     *
     *     const d = math.normalDist(0, 1)
     *     d.pdf(0)      // returns 0.3989422804014327
     *     d.cdf(1.96)   // returns ~0.975
     *     d.icdf(0.975) // returns ~1.96
     *     d.mean        // returns 0
     *     d.variance    // returns 1
     *
     * See also:
     *
     *     tDist, chiSquaredDist, poissonDist, binomialDist
     *
     * @param {number} mu      Mean of the distribution
     * @param {number} sigma   Standard deviation (must be positive)
     * @return {Object}        Distribution object with pdf, cdf, icdf, mean, variance
     */
    return typed(name, {
      'number, number': function (mu, sigma) {
        if (sigma <= 0) {
          throw new Error('normalDist: sigma must be positive')
        }

        return {
          pdf: function (x) {
            const z = (x - mu) / sigma
            return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
          },
          cdf: function (x) {
            return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)))
          },
          icdf: function (p) {
            if (p <= 0 || p >= 1) {
              throw new Error('normalDist icdf: p must be in (0, 1)')
            }
            return mu + sigma * Math.SQRT2 * erfInv(2 * p - 1)
          },
          mean: mu,
          variance: sigma * sigma
        }
      }
    })

    /**
     * Error function approximation (Horner's method, max error ~1.2e-7)
     * @param {number} x
     * @return {number}
     */
    function erf (x) {
      const sign = x >= 0 ? 1 : -1
      x = Math.abs(x)

      // Constants for rational approximation
      const t = 1 / (1 + 0.3275911 * x)
      const y =
        1 -
        (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t +
          0.254829592) *
          t *
          Math.exp(-x * x)

      return sign * y
    }

    /**
     * Inverse error function using rational approximation
     * Based on Peter Acklam's algorithm
     * @param {number} x  value in (-1, 1)
     * @return {number}
     */
    function erfInv (x) {
      // erfInv(x) = sign(x) * sqrt(-log((1 - |x|) / 2)) approximation
      // We use the inverse normal via rational approx then scale
      const p = (1 + x) / 2

      // Coefficients for rational approximation of probit
      const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
        1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
      const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
        6.680131188771972e1, -1.328068155288572e1]
      const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
        -2.549732539343734, 4.374664141464968, 2.938163982698783]
      const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]

      const pLow = 0.02425
      const pHigh = 1 - pLow

      let q, r, val

      if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p))
        val = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      } else if (p <= pHigh) {
        q = p - 0.5
        r = q * q
        val = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
          (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
      } else {
        q = Math.sqrt(-2 * Math.log(1 - p))
        val = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      }

      // erfInv(x) = probit((1+x)/2) / sqrt(2)
      return val / Math.SQRT2
    }
  }
)
