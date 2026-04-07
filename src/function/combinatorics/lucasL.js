import { factory } from '../../utils/factory.js'

const name = 'lucasL'
const dependencies = ['typed']

export const createLucasL = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the nth Lucas number using an iterative approach.
   *
   * The Lucas sequence is defined as:
   * L(0) = 2, L(1) = 1, L(n) = L(n-1) + L(n-2)
   *
   * Syntax:
   *
   *   math.lucasL(n)
   *
   * Examples:
   *
   *    math.lucasL(0)    // returns 2
   *    math.lucasL(1)    // returns 1
   *    math.lucasL(5)    // returns 11
   *    math.lucasL(10)   // returns 123
   *
   * See also:
   *
   *    fibonacci, bellNumbers, catalan
   *
   * @param {number} n  Non-negative integer index
   * @return {number}   The nth Lucas number L(n)
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 0) {
        throw new TypeError('Non-negative integer value expected in function lucasL')
      }
      if (n === 0) return 2
      if (n === 1) return 1

      let prev = 2 // L(0)
      let curr = 1 // L(1)
      for (let i = 2; i <= n; i++) {
        const next = prev + curr
        prev = curr
        curr = next
      }
      return curr
    }
  })
})
