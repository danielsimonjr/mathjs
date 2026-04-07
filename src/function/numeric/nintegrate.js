import { factory } from '../../utils/factory.js'

const name = 'nintegrate'
const dependencies = ['typed']

export const createNintegrate = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Numerically integrate a function over an interval [a, b]
     * using adaptive Gauss-Kronrod quadrature (7-15 point rule).
     *
     * Syntax:
     *
     *    math.nintegrate(f, a, b)
     *    math.nintegrate(f, a, b, options)
     *
     * Examples:
     *
     *    math.nintegrate(x => x*x, 0, 1)           // 0.3333333333...
     *    math.nintegrate(Math.sin, 0, Math.PI)      // 2
     *    math.nintegrate(Math.exp, 0, 1, {tol: 1e-14})
     *
     * See also:
     *
     *    derivative, solveODE, simpsons, trapz
     *
     * @param {Function} f   The function to integrate
     * @param {number} a     Lower bound
     * @param {number} b     Upper bound
     * @param {Object} [options]  Options: tol (default 1e-10), maxDepth (default 50)
     * @return {number}      The numerical integral
     */
    // Gauss-Kronrod 7-15 point quadrature nodes and weights
    const gkNodes = [
      0.0, 0.20778495500789848, 0.40584515137739717,
      0.58608723546769113, 0.74153118559939444,
      0.86486442335976907, 0.94910791234275852, 0.99145537112081264
    ]
    const gkWeights15 = [
      0.20948214108472783, 0.20443294007529889, 0.19035057806478541,
      0.16900472663926790, 0.14065325971552592, 0.10479001032225018,
      0.06309209262997855, 0.02293532201052922
    ]
    const gkWeights7 = [
      0.41795918367346939, 0.0, 0.38183005050511894,
      0.0, 0.27970539148927664, 0.0,
      0.12948496616886969, 0.0
    ]

    return typed(name, {
      'function, number, number': function (f, a, b) {
        return _adaptiveQuad(f, a, b, 1e-10, 50, 0)
      },
      'function, number, number, Object': function (f, a, b, options) {
        const tol = options.tol !== undefined ? options.tol : 1e-10
        const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 50
        return _adaptiveQuad(f, a, b, tol, maxDepth, 0)
      }
    })

    function _gaussKronrod (f, a, b) {
      const mid = (a + b) / 2
      const halfLen = (b - a) / 2
      let result15 = 0
      let result7 = 0

      for (let i = 0; i < gkNodes.length; i++) {
        const x1 = mid + halfLen * gkNodes[i]
        const x2 = mid - halfLen * gkNodes[i]
        const fx1 = f(x1)
        const fx2 = i === 0 ? fx1 : f(x2)
        const fsum = i === 0 ? fx1 : fx1 + fx2

        result15 += gkWeights15[i] * fsum
        result7 += gkWeights7[i] * fsum
      }

      result15 *= halfLen
      result7 *= halfLen

      return { result: result15, error: Math.abs(result15 - result7) }
    }

    function _adaptiveQuad (f, a, b, tol, maxDepth, depth) {
      const { result, error } = _gaussKronrod(f, a, b)

      if (error < tol || depth >= maxDepth) {
        return result
      }

      const mid = (a + b) / 2
      return _adaptiveQuad(f, a, mid, tol / 2, maxDepth, depth + 1) +
             _adaptiveQuad(f, mid, b, tol / 2, maxDepth, depth + 1)
    }
  }
)
