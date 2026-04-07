import { factory } from '../../utils/factory.js'

const name = 'logNormalDist'
const dependencies = ['typed']

export const createLogNormalDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a log-normal distribution object with log-scale parameters mu and sigma.
     * Returns an object with pdf, cdf, icdf methods and mean, variance properties.
     *
     * Syntax:
     *
     *     math.logNormalDist(mu, sigma)
     *
     * Examples:
     *
     *     const d = math.logNormalDist(0, 1)
     *     d.pdf(1)    // returns ~0.3989
     *     d.cdf(1)    // returns 0.5
     *     d.icdf(0.5) // returns 1
     *     d.mean      // returns ~1.6487
     *     d.variance  // returns ~4.6708
     *
     * See also:
     *
     *     normalDist, gammaDist, exponentialDist
     *
     * @param {number} mu     Mean of the underlying normal distribution (log-scale)
     * @param {number} sigma  Standard deviation of the underlying normal distribution (must be positive)
     * @return {Object}       Distribution object with pdf, cdf, icdf, mean, variance
     */
    return typed(name, {
      'number, number': function (mu, sigma) {
        if (sigma <= 0) {
          throw new Error('logNormalDist: sigma must be positive')
        }

        /**
         * Error function approximation (Horner's method, max error ~1.2e-7)
         */
        function erf (x) {
          const sign = x >= 0 ? 1 : -1
          x = Math.abs(x)
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
         * Inverse error function using rational approximation (Acklam's algorithm)
         */
        function erfInv (x) {
          const p = (1 + x) / 2
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

          return val / Math.SQRT2
        }

        const sigma2 = sigma * sigma

        return {
          pdf: function (x) {
            if (x <= 0) return 0
            const lx = Math.log(x)
            const z = (lx - mu) / sigma
            return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI))
          },
          cdf: function (x) {
            if (x <= 0) return 0
            return 0.5 * (1 + erf((Math.log(x) - mu) / (sigma * Math.SQRT2)))
          },
          icdf: function (p) {
            if (p <= 0 || p >= 1) {
              throw new Error('logNormalDist icdf: p must be in (0, 1)')
            }
            return Math.exp(mu + sigma * Math.SQRT2 * erfInv(2 * p - 1))
          },
          mean: Math.exp(mu + sigma2 / 2),
          variance: (Math.exp(sigma2) - 1) * Math.exp(2 * mu + sigma2)
        }
      }
    })
  }
)
