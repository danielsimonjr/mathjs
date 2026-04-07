import { factory } from '../../utils/factory.js'

const name = 'linreg'
const dependencies = ['typed']

export const createLinreg = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform simple linear regression on two datasets (ordinary least squares).
     * Fits the model: y = slope * x + intercept
     *
     * Returns an object with:
     * - `slope`: regression slope
     * - `intercept`: y-intercept
     * - `r`: Pearson correlation coefficient
     * - `r2`: coefficient of determination (R-squared)
     * - `predict(x)`: function that predicts y for a given x
     *
     * Syntax:
     *
     *     math.linreg(x, y)
     *
     * Examples:
     *
     *     const result = math.linreg([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
     *     result.slope       // returns 0.6
     *     result.intercept   // returns 2.2
     *     result.r2          // returns 0.5142...
     *     result.predict(6)  // returns 5.8
     *
     * See also:
     *
     *     covariance, mean, std
     *
     * @param {Array | Matrix} x   Independent variable (predictor)
     * @param {Array | Matrix} y   Dependent variable (response)
     * @return {Object}            Object with slope, intercept, r, r2, predict
     */
    return typed(name, {
      'Array | Matrix, Array | Matrix': function (x, y) {
        const xData = Array.isArray(x) ? x.flat(Infinity) : x.toArray().flat(Infinity)
        const yData = Array.isArray(y) ? y.flat(Infinity) : y.toArray().flat(Infinity)

        const n = xData.length

        if (n !== yData.length) {
          throw new Error('linreg requires x and y to have the same length')
        }

        if (n < 2) {
          throw new Error('linreg requires at least 2 data points')
        }

        let sumX = 0
        let sumY = 0
        let sumXY = 0
        let sumX2 = 0
        let sumY2 = 0

        for (let i = 0; i < n; i++) {
          sumX += xData[i]
          sumY += yData[i]
          sumXY += xData[i] * yData[i]
          sumX2 += xData[i] * xData[i]
          sumY2 += yData[i] * yData[i]
        }

        const meanX = sumX / n
        const meanY = sumY / n

        const ssXX = sumX2 - n * meanX * meanX
        const ssYY = sumY2 - n * meanY * meanY
        const ssXY = sumXY - n * meanX * meanY

        if (ssXX === 0) {
          throw new Error('linreg: all x values are identical, cannot fit a line')
        }

        const slope = ssXY / ssXX
        const intercept = meanY - slope * meanX

        const r = ssXX === 0 || ssYY === 0 ? 0 : ssXY / Math.sqrt(ssXX * ssYY)
        const r2 = r * r

        return {
          slope,
          intercept,
          r,
          r2,
          predict: function (xVal) {
            return slope * xVal + intercept
          }
        }
      }
    })
  }
)
