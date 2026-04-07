import { factory } from '../../utils/factory.js'

const name = 'partitions'
const dependencies = ['typed']

export const createPartitions = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Count the number of integer partitions of n (P(n)).
   *
   * P(n) is the number of ways to write n as an ordered (by size) sum of
   * positive integers. Uses Euler's recurrence via pentagonal numbers:
   * P(n) = sum_{k != 0} (-1)^(k+1) * P(n - k*(3k-1)/2)
   *
   * Syntax:
   *
   *   math.partitions(n)
   *
   * Examples:
   *
   *    math.partitions(0)    // returns 1
   *    math.partitions(1)    // returns 1
   *    math.partitions(4)    // returns 5
   *    math.partitions(5)    // returns 7
   *    math.partitions(10)   // returns 42
   *    math.partitions(100)  // returns 190569292
   *
   * See also:
   *
   *    combinations, bellNumbers, stirlingS2
   *
   * @param {number} n  Non-negative integer
   * @return {number}   Number of integer partitions P(n)
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 0) {
        throw new TypeError('Non-negative integer value expected in function partitions')
      }

      // Build partition table using Euler's pentagonal number theorem
      const p = new Array(n + 1).fill(0)
      p[0] = 1

      for (let i = 1; i <= n; i++) {
        let sum = 0
        let k = 1
        // Iterate over generalized pentagonal numbers: g(k) = k*(3k-1)/2
        // k = 1, -1, 2, -2, 3, -3, ...
        while (true) {
          // Positive k: g = k*(3k-1)/2
          const gPos = k * (3 * k - 1) / 2
          if (gPos > i) break
          const sign = k % 2 === 0 ? -1 : 1
          sum += sign * p[i - gPos]

          // Negative k: g = k*(3k+1)/2
          const gNeg = k * (3 * k + 1) / 2
          if (gNeg <= i) {
            sum += sign * p[i - gNeg]
          }

          k++
        }
        p[i] = sum
      }

      return p[n]
    }
  })
})
