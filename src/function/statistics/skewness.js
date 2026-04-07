import { factory } from '../../utils/factory.js'

const name = 'skewness'
const dependencies = ['typed']

export const createSkewness = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the sample skewness of a dataset.
     * Skewness measures the asymmetry of the probability distribution.
     * Uses the adjusted Fisher-Pearson standardized moment coefficient:
     * `skewness = (n / ((n-1) * (n-2))) * sum((x_i - mean)^3) / std^3`
     *
     * Syntax:
     *
     *     math.skewness(array)
     *
     * Examples:
     *
     *     math.skewness([2, 4, 6, 8, 10])        // returns 0
     *     math.skewness([1, 2, 3, 4, 100])       // returns positive value (right skew)
     *
     * See also:
     *
     *     mean, std, variance, kurtosis
     *
     * @param {Array | Matrix} array   A single matrix or array with values
     * @return {number}                The sample skewness
     */
    return typed(name, {
      'Array | Matrix': function (arr) {
        const data = Array.isArray(arr) ? arr.flat(Infinity) : arr.toArray().flat(Infinity)
        const n = data.length

        if (n < 3) {
          throw new Error('skewness requires at least 3 data points')
        }

        const mean = data.reduce((sum, x) => sum + x, 0) / n
        let m2 = 0
        let m3 = 0
        for (const x of data) {
          const d = x - mean
          m2 += d * d
          m3 += d * d * d
        }

        const variance = m2 / (n - 1)
        const std = Math.sqrt(variance)

        if (std === 0) {
          throw new Error('skewness is undefined when standard deviation is zero')
        }

        const skew = (n / ((n - 1) * (n - 2))) * m3 / (std * std * std)
        return skew
      }
    })
  }
)
