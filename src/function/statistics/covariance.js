import { factory } from '../../utils/factory.js'

const name = 'covariance'
const dependencies = ['typed']

export const createCovariance = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the sample covariance of two datasets.
     * `cov(x, y) = sum((x_i - mean_x) * (y_i - mean_y)) / (n - 1)`
     *
     * Syntax:
     *
     *     math.covariance(x, y)
     *
     * Examples:
     *
     *     math.covariance([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])   // returns 1.5
     *     math.covariance([1, 2, 3], [3, 2, 1])                // returns -1 (negative covariance)
     *
     * See also:
     *
     *     mean, std, variance, linreg
     *
     * @param {Array | Matrix} x   First dataset
     * @param {Array | Matrix} y   Second dataset (must be same length as x)
     * @return {number}            The sample covariance
     */
    return typed(name, {
      'Array | Matrix, Array | Matrix': function (x, y) {
        const xData = Array.isArray(x) ? x.flat(Infinity) : x.toArray().flat(Infinity)
        const yData = Array.isArray(y) ? y.flat(Infinity) : y.toArray().flat(Infinity)

        const n = xData.length

        if (n !== yData.length) {
          throw new Error('covariance requires x and y to have the same length')
        }

        if (n < 2) {
          throw new Error('covariance requires at least 2 data points')
        }

        const meanX = xData.reduce((sum, v) => sum + v, 0) / n
        const meanY = yData.reduce((sum, v) => sum + v, 0) / n

        let cov = 0
        for (let i = 0; i < n; i++) {
          cov += (xData[i] - meanX) * (yData[i] - meanY)
        }

        return cov / (n - 1)
      }
    })
  }
)
