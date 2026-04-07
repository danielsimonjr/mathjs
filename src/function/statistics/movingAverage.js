import { factory } from '../../utils/factory.js'

const name = 'movingAverage'
const dependencies = ['typed']

export const createMovingAverage = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the simple moving average of a dataset with a given window size.
     * Returns an array of length (n - window + 1), where each element is the
     * mean of a consecutive window of values.
     *
     * Syntax:
     *
     *     math.movingAverage(array, window)
     *
     * Examples:
     *
     *     math.movingAverage([1, 2, 3, 4, 5], 3)   // returns [2, 3, 4]
     *     math.movingAverage([10, 20, 30, 40], 2)   // returns [15, 25, 35]
     *
     * See also:
     *
     *     mean, sum
     *
     * @param {Array | Matrix} array   Input data array
     * @param {number} window          Window size (must be a positive integer)
     * @return {Array}                 Array of moving averages
     */
    return typed(name, {
      'Array | Matrix, number': function (arr, window) {
        const data = Array.isArray(arr) ? arr.flat(Infinity) : arr.toArray().flat(Infinity)
        const n = data.length

        if (!Number.isInteger(window) || window < 1) {
          throw new Error('movingAverage: window must be a positive integer')
        }

        if (window > n) {
          throw new Error('movingAverage: window size cannot exceed array length')
        }

        const result = []

        // Compute initial window sum
        let windowSum = 0
        for (let i = 0; i < window; i++) {
          windowSum += data[i]
        }
        result.push(windowSum / window)

        // Slide the window
        for (let i = window; i < n; i++) {
          windowSum += data[i] - data[i - window]
          result.push(windowSum / window)
        }

        return result
      }
    })
  }
)
