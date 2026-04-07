import { factory } from '../../utils/factory.js'

const name = 'kurtosis'
const dependencies = ['typed']

export const createKurtosis = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the sample excess kurtosis of a dataset.
     * Kurtosis measures the "tailedness" of the probability distribution.
     * Uses the formula for sample excess kurtosis:
     * `kurtosis = ((n*(n+1)) / ((n-1)*(n-2)*(n-3))) * sum((x_i - mean)^4 / std^4)
     *             - (3*(n-1)^2) / ((n-2)*(n-3))`
     *
     * A normal distribution has excess kurtosis = 0.
     *
     * Syntax:
     *
     *     math.kurtosis(array)
     *
     * Examples:
     *
     *     math.kurtosis([2, 4, 4, 4, 5, 5, 7, 9])  // returns -0.3061... (platykurtic)
     *     math.kurtosis([1, 2, 3, 4, 5])             // returns -1.3 (uniform-like)
     *
     * See also:
     *
     *     mean, std, variance, skewness
     *
     * @param {Array | Matrix} array   A single matrix or array with values
     * @return {number}                The sample excess kurtosis
     */
    return typed(name, {
      'Array | Matrix': function (arr) {
        const data = Array.isArray(arr) ? arr.flat(Infinity) : arr.toArray().flat(Infinity)
        const n = data.length

        if (n < 4) {
          throw new Error('kurtosis requires at least 4 data points')
        }

        const mean = data.reduce((sum, x) => sum + x, 0) / n
        let m2 = 0
        let m4 = 0
        for (const x of data) {
          const d = x - mean
          const d2 = d * d
          m2 += d2
          m4 += d2 * d2
        }

        const variance = m2 / (n - 1)
        const std = Math.sqrt(variance)

        if (std === 0) {
          throw new Error('kurtosis is undefined when standard deviation is zero')
        }

        const s4 = std * std * std * std
        const kurt =
          ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * (m4 / s4) -
          (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3))

        return kurt
      }
    })
  }
)
