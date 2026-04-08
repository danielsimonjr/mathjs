import { factory } from '../../utils/factory.js'

const name = 'chebyshevApprox'
const dependencies = ['typed']

export const createChebyshevApprox = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute a Chebyshev polynomial approximation of a function on an interval.
     *
     * Samples the function at n Chebyshev nodes on [a, b], computes the
     * Chebyshev coefficients via the Discrete Cosine Transform (DCT-II inverse),
     * and returns an evaluator using Clenshaw's algorithm.
     *
     * The approximation uses the first n Chebyshev polynomials T_0, T_1, ..., T_{n-1}.
     *
     * Syntax:
     *
     *    math.chebyshevApprox(f, a, b, n)
     *
     * Examples:
     *
     *    const approx = math.chebyshevApprox(sin, 0, pi, 10)
     *    approx.evaluate(1)     // approximation to sin(1)
     *    approx.coefficients    // Chebyshev coefficients
     *
     * See also:
     *
     *    padeApproximant, polyfit, cspline
     *
     * @param {Function} f  Function to approximate
     * @param {number}   a  Left endpoint of interval
     * @param {number}   b  Right endpoint of interval
     * @param {number}   n  Number of Chebyshev terms (degree = n-1)
     * @return {Object}  Object with `coefficients` array and `evaluate(x)` method
     */
    return typed(name, {
      'function, number, number, number': function (f, a, b, n) {
        return _chebyshevApprox(f, a, b, n)
      }
    })

    function _chebyshevApprox (f, a, b, n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new Error('chebyshevApprox: n must be a positive integer, got ' + n)
      }
      if (a >= b) {
        throw new Error('chebyshevApprox: a must be less than b')
      }

      // Sample at Chebyshev nodes on [-1, 1]: x_k = cos(pi*(k+0.5)/n)
      // Mapped to [a, b]: t_k = 0.5*(b+a) + 0.5*(b-a)*x_k
      const fvals = new Array(n)
      for (let k = 0; k < n; k++) {
        const xk = Math.cos(Math.PI * (k + 0.5) / n)
        const tk = 0.5 * (b + a) + 0.5 * (b - a) * xk
        fvals[k] = f(tk)
      }

      // Chebyshev coefficients via DCT:
      // c[j] = (2/n) * sum_{k=0}^{n-1} f(t_k) * T_j(x_k)
      //      = (2/n) * sum_{k=0}^{n-1} f(t_k) * cos(pi*j*(k+0.5)/n)
      // c[0] divided by 2 (leading factor convention)
      const coeffs = new Array(n)
      for (let j = 0; j < n; j++) {
        let sum = 0
        for (let k = 0; k < n; k++) {
          sum += fvals[k] * Math.cos(Math.PI * j * (k + 0.5) / n)
        }
        coeffs[j] = (2 / n) * sum
      }
      // Use the half-amplitude convention: c[0] /= 2
      coeffs[0] /= 2

      return {
        coefficients: coeffs,
        evaluate: function (x) {
          if (x < a - 1e-14 || x > b + 1e-14) {
            throw new Error(
              'chebyshevApprox.evaluate: x=' + x +
              ' is outside the approximation interval [' + a + ', ' + b + ']'
            )
          }
          // Map x from [a,b] to [-1,1]
          const t = (2 * x - (a + b)) / (b - a)
          // Clenshaw's algorithm for sum c[j] * T_j(t)
          return _clenshaw(coeffs, t)
        }
      }
    }

    function _clenshaw (c, t) {
      const n = c.length
      // Clenshaw recurrence for Chebyshev sum
      let b1 = 0
      let b2 = 0
      for (let j = n - 1; j >= 1; j--) {
        const tmp = 2 * t * b1 - b2 + c[j]
        b2 = b1
        b1 = tmp
      }
      return t * b1 - b2 + c[0]
    }
  }
)
