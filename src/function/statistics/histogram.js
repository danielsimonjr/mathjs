import { factory } from '../../utils/factory.js'

const name = 'histogram'
const dependencies = ['typed']

export const createHistogram = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute a frequency histogram of data.
     *
     * If bins is a number, computes that many equal-width bins spanning from min to max.
     * If bins is an array, uses those values as bin edges (length = number of bins + 1).
     *
     * Returns an object with:
     *   - counts: array of counts per bin
     *   - binEdges: array of bin boundary values (length = bins + 1)
     *   - binCenters: array of bin center values (length = bins)
     *
     * Syntax:
     *
     *     math.histogram(data, bins)
     *
     * Examples:
     *
     *     histogram([1, 2, 2, 3, 3, 3], 3)
     *     histogram([1, 2, 2, 3, 3, 3], [1, 2, 3, 4])
     *
     * See also:
     *
     *     mean, std, variance
     *
     * @param {Array} data    Array of numeric values
     * @param {number|Array} bins  Number of equal-width bins, or array of bin edges
     * @return {Object}       Object with counts, binEdges, binCenters
     */
    return typed(name, {
      'Array, number': function (data, bins) {
        if (!Number.isInteger(bins) || bins < 1) {
          throw new Error('histogram: bins must be a positive integer')
        }
        if (data.length === 0) {
          throw new Error('histogram: data must not be empty')
        }

        const minVal = Math.min(...data)
        const maxVal = Math.max(...data)

        // Handle edge case where all values are equal
        const range = maxVal - minVal
        const step = range === 0 ? 1 : range / bins

        const binEdges = []
        for (let i = 0; i <= bins; i++) {
          binEdges.push(minVal + i * step)
        }
        // Ensure last edge exactly equals maxVal to avoid floating point issues
        binEdges[bins] = maxVal + (range === 0 ? 1 : 0)

        return computeCounts(data, binEdges)
      },

      'Array, Array': function (data, binEdges) {
        if (binEdges.length < 2) {
          throw new Error('histogram: binEdges must have at least 2 elements')
        }
        for (let i = 1; i < binEdges.length; i++) {
          if (binEdges[i] <= binEdges[i - 1]) {
            throw new Error('histogram: binEdges must be strictly increasing')
          }
        }

        return computeCounts(data, binEdges)
      }
    })

    /**
     * Given data and bin edges, compute counts and bin centers.
     * Each bin is [edge[i], edge[i+1]), except the last bin is [edge[n-1], edge[n]].
     * @param {Array} data
     * @param {Array} binEdges
     * @return {Object}
     */
    function computeCounts (data, binEdges) {
      const numBins = binEdges.length - 1
      const counts = new Array(numBins).fill(0)

      for (let j = 0; j < data.length; j++) {
        const val = data[j]
        if (val < binEdges[0] || val > binEdges[numBins]) {
          // Outside range — skip
          continue
        }
        if (val === binEdges[numBins]) {
          // Include max value in last bin
          counts[numBins - 1]++
          continue
        }
        // Binary search for bin
        let lo = 0
        let hi = numBins - 1
        while (lo < hi) {
          const mid = (lo + hi) >> 1
          if (val < binEdges[mid + 1]) {
            hi = mid
          } else {
            lo = mid + 1
          }
        }
        counts[lo]++
      }

      const binCenters = []
      for (let i = 0; i < numBins; i++) {
        binCenters.push((binEdges[i] + binEdges[i + 1]) / 2)
      }

      return { counts, binEdges, binCenters }
    }
  }
)
