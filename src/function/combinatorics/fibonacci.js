import { factory } from '../../utils/factory.js'

const name = 'fibonacci'
const dependencies = ['typed']

export const createFibonacci = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the nth Fibonacci number using the fast doubling algorithm.
   * The sequence is: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).
   * For n > 70 the result exceeds Number.MAX_SAFE_INTEGER; use BigInt input
   * to obtain an exact result.
   *
   * Syntax:
   *
   *   math.fibonacci(n)
   *
   * Examples:
   *
   *    math.fibonacci(0)   // returns 0
   *    math.fibonacci(1)   // returns 1
   *    math.fibonacci(10)  // returns 55
   *    math.fibonacci(20)  // returns 6765
   *
   * See also:
   *
   *    factorial, combinations
   *
   * @param {number | bigint} n   Non-negative integer index
   * @return {number | bigint}    The nth Fibonacci number F(n)
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n)) {
        throw new TypeError('Integer value expected in function fibonacci')
      }
      if (n < 0) {
        throw new TypeError('Non-negative integer value expected in function fibonacci')
      }
      if (n > 70) {
        // Result overflows Number.MAX_SAFE_INTEGER; warn the caller
        throw new TypeError(
          'fibonacci(n) with n > 70 exceeds Number.MAX_SAFE_INTEGER. ' +
          'Use BigInt input (e.g., fibonacci(71n)) for exact results.'
        )
      }
      const [f] = _fastDoubling(n)
      return f
    },

    bigint: function (n) {
      if (n < 0n) {
        throw new TypeError('Non-negative integer value expected in function fibonacci')
      }
      const [f] = _fastDoublingBig(n)
      return f
    }
  })

  /**
   * Fast doubling for JS number (safe up to n=70).
   * Returns [F(n), F(n+1)].
   */
  function _fastDoubling (n) {
    if (n === 0) return [0, 1]
    const [a, b] = _fastDoubling(Math.floor(n / 2))
    const c = a * (2 * b - a)
    const d = a * a + b * b
    if (n % 2 === 0) {
      return [c, d]
    } else {
      return [d, c + d]
    }
  }

  /**
   * Fast doubling for BigInt.
   * Returns [F(n), F(n+1)].
   */
  function _fastDoublingBig (n) {
    if (n === 0n) return [0n, 1n]
    const [a, b] = _fastDoublingBig(n / 2n)
    const c = a * (2n * b - a)
    const d = a * a + b * b
    if (n % 2n === 0n) {
      return [c, d]
    } else {
      return [d, c + d]
    }
  }
})
