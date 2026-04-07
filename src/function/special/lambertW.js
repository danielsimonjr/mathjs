/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'lambertW'
const dependencies = ['typed']

export const createLambertW = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Lambert W function W(x), the principal branch W_0.
     * W(x) is defined as the inverse of f(W) = W * e^W, i.e. W(x) * e^(W(x)) = x.
     *
     * The function is defined for x >= -1/e (approximately -0.36787944).
     * Uses Halley's iteration for fast convergence.
     *
     * Syntax:
     *
     *    math.lambertW(x)
     *
     * Examples:
     *
     *    math.lambertW(0)          // returns 0
     *    math.lambertW(1)          // returns 0.5671432904097838
     *    math.lambertW(Math.E)     // returns 1
     *    math.lambertW(-1/Math.E)  // returns -1
     *
     * See also:
     *
     *    exp, log
     *
     * @param {number} x   A real number >= -1/e
     * @return {number}    The Lambert W function value W(x)
     */
    return typed(name, {
      number: function (x) {
        const NEG_INV_E = -1 / Math.E

        if (x < NEG_INV_E) {
          throw new RangeError('lambertW: x must be >= -1/e, got ' + x)
        }

        if (x === 0) return 0
        if (x === NEG_INV_E) return -1

        // Choose initial estimate
        let w
        if (x < 0) {
          // Near the branch point -1/e, use a series-derived estimate
          const p = Math.sqrt(2 * (Math.E * x + 1))
          w = -1 + p - (1 / 3) * p * p + (11 / 72) * p * p * p
        } else if (x <= 1) {
          // Small non-negative: W(x) ~ x for x near 0 (W(1) ~ 0.567)
          w = x * 0.567
        } else {
          // Large x: asymptotic W(x) ~ ln(x) - ln(ln(x))
          const lx = Math.log(x)
          const llx = Math.log(lx)
          w = lx - llx
        }

        // Halley's iteration
        return _halleyIterate(x, w)
      }
    })

    function _halleyIterate (x, w) {
      const MAX_ITER = 100
      const TOL = 1e-13

      for (let i = 0; i < MAX_ITER; i++) {
        const ew = Math.exp(w)
        const wew = w * ew
        const f = wew - x
        const fprime = ew * (w + 1)
        const fprimeprime = ew * (w + 2)
        // Halley step
        const denom = fprime - (f * fprimeprime) / (2 * fprime)
        const delta = f / denom
        w -= delta
        if (Math.abs(delta) <= TOL * Math.abs(w)) break
      }

      return w
    }
  }
)
