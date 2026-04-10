import { factory } from '../../utils/factory.js'

const name = 'differences'
const dependencies = ['typed']

export const createDifferences = /* #__PURE__ */ factory(name, dependencies, ({
  typed
}) => {
  /**
   * Compute finite differences of a sequence. The first-order finite difference
   * is the discrete analog of the derivative.
   *
   * First differences: Δa[i] = a[i+1] - a[i]
   * Higher orders: apply the operator repeatedly.
   *
   * Syntax:
   *
   *     math.differences(sequence)
   *     math.differences(sequence, order)
   *
   * Examples:
   *
   *     math.differences([1, 4, 9, 16, 25])     // [3, 5, 7, 9]
   *     math.differences([1, 4, 9, 16, 25], 2)  // [2, 2, 2]
   *     math.differences([1, 2, 4, 8, 16], 1)   // [1, 2, 4, 8]
   *
   * See also:
   *
   *     derivative, taylor, cumsum
   *
   * @param  {Array.<number>}  sequence  The input sequence (array of numbers)
   * @param  {number}          [order=1] The order of differences (default 1)
   * @return {Array.<number>}            The finite differences
   */
  function computeDifferences (sequence, order) {
    if (!Array.isArray(sequence)) {
      throw new Error('differences: expected an array as the first argument')
    }

    const n = (order === undefined || order === null) ? 1 : order

    if (!Number.isInteger(n) || n < 0) {
      throw new Error('differences: order must be a non-negative integer, got ' + n)
    }

    if (n === 0) return sequence.slice()

    let result = sequence.slice()
    for (let k = 0; k < n; k++) {
      if (result.length < 2) {
        return []
      }
      const next = []
      for (let i = 0; i < result.length - 1; i++) {
        next.push(result[i + 1] - result[i])
      }
      result = next
    }

    return result
  }

  return typed(name, {
    Array: function (sequence) {
      return computeDifferences(sequence, 1)
    },
    'Array, number': function (sequence, order) {
      return computeDifferences(sequence, order)
    }
  })
})
