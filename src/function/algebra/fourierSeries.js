import { factory } from '../../utils/factory.js'

const name = 'fourierSeries'
const dependencies = [
  'typed',
  'parse',
  'evaluate'
]

export const createFourierSeries = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate
}) => {
  /**
   * Compute the Fourier series coefficients of a periodic function using numeric integration.
   *
   * For a function f(x) with period T, computes:
   *   a0 = (1/T) * integral from 0 to T of f(x) dx
   *   an = (2/T) * integral from 0 to T of f(x)*cos(2*pi*n*x/T) dx
   *   bn = (2/T) * integral from 0 to T of f(x)*sin(2*pi*n*x/T) dx
   *
   * Uses Simpson's rule for numeric integration with 1000 intervals.
   *
   * Syntax:
   *
   *     math.fourierSeries(expr, variable, period, nTerms)
   *
   * Examples:
   *
   *     math.fourierSeries('x', 'x', 2 * pi, 3)
   *     math.fourierSeries('x^2', 'x', 2 * pi, 2)
   *
   * See also:
   *
   *     evaluate, integrate
   *
   * @param {string | Node} expr   The periodic function expression
   * @param {string} variable      The function variable
   * @param {number} period        The period T
   * @param {number} [nTerms=3]    Number of harmonic terms to compute
   * @return {Object}              { a0: number, an: number[], bn: number[] }
   */
  function computeFourierSeries (expr, variable, period, nTerms) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const T = period
    const N = (nTerms === undefined || nTerms === null) ? 3 : Math.round(nTerms)
    const numIntervals = 1000 // must be even for Simpson's rule

    // Evaluate f(x) at a point
    function f (x) {
      const scope = {}
      scope[varName] = x
      try {
        return Number(evaluate(exprStr, scope))
      } catch (e) {
        return 0
      }
    }

    // Simpson's rule integration from 0 to T
    function simpsonsIntegral (g) {
      const h = T / numIntervals
      let sum = g(0) + g(T)
      for (let i = 1; i < numIntervals; i++) {
        const x = i * h
        sum += (i % 2 === 0 ? 2 : 4) * g(x)
      }
      return (h / 3) * sum
    }

    const PI2_over_T = 2 * Math.PI / T

    const a0 = (1 / T) * simpsonsIntegral(x => f(x))

    const an = []
    const bn = []
    for (let k = 1; k <= N; k++) {
      const kPI2_T = k * PI2_over_T
      const ak = (2 / T) * simpsonsIntegral(x => f(x) * Math.cos(kPI2_T * x))
      const bk = (2 / T) * simpsonsIntegral(x => f(x) * Math.sin(kPI2_T * x))
      an.push(_roundSmall(ak))
      bn.push(_roundSmall(bk))
    }

    return { a0: _roundSmall(a0), an, bn }
  }

  function _roundSmall (val) {
    // Round values very close to zero to 0 to avoid floating-point noise
    return Math.abs(val) < 1e-10 ? 0 : val
  }

  return typed(name, {
    'string, string, number': (expr, variable, period) =>
      computeFourierSeries(expr, variable, period, 3),
    'Node, string, number': (expr, variable, period) =>
      computeFourierSeries(expr.toString(), variable, period, 3),
    'string, string, number, number': (expr, variable, period, nTerms) =>
      computeFourierSeries(expr, variable, period, nTerms),
    'Node, string, number, number': (expr, variable, period, nTerms) =>
      computeFourierSeries(expr.toString(), variable, period, nTerms)
  })
})
