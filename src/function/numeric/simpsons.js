import { factory } from '../../utils/factory.js'

const name = 'simpsons'
const dependencies = ['typed']

export const createSimpsons = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Numerically integrate a function using Simpson's rule.
     *
     * Syntax:
     *
     *    math.simpsons(f, a, b)
     *    math.simpsons(f, a, b, n)
     *
     * Examples:
     *
     *    math.simpsons(x => x*x, 0, 1)         // 0.3333333333...
     *    math.simpsons(Math.sin, 0, Math.PI)    // 2
     *    math.simpsons(Math.exp, 0, 1, 200)     // e - 1
     *
     * See also:
     *
     *    nintegrate, trapz
     *
     * @param {Function} f   The function to integrate
     * @param {number} a     Lower bound
     * @param {number} b     Upper bound
     * @param {number} [n]   Number of intervals (must be even, default 100)
     * @return {number}      The numerical integral
     */
    return typed(name, {
      'function, number, number': function (f, a, b) {
        return _simpsons(f, a, b, 100)
      },
      'function, number, number, number': function (f, a, b, n) {
        if (n <= 0 || !Number.isInteger(n)) {
          throw new Error('simpsons: n must be a positive integer')
        }
        if (n % 2 !== 0) {
          throw new Error('simpsons: n must be even')
        }
        return _simpsons(f, a, b, n)
      }
    })

    function _simpsons (f, a, b, n) {
      const h = (b - a) / n
      let sum = f(a) + f(b)

      for (let i = 1; i < n; i++) {
        const x = a + i * h
        sum += (i % 2 === 0 ? 2 : 4) * f(x)
      }

      return (h / 3) * sum
    }
  }
)
