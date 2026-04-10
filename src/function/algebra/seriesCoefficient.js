import { factory } from '../../utils/factory.js'

const name = 'seriesCoefficient'
const dependencies = ['typed', 'parse', 'derivative', 'evaluate', 'factorial']

export const createSeriesCoefficient = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  evaluate,
  factorial
}) => {
  /**
   * Extract the nth coefficient from the Taylor series expansion of an expression around a point.
   * Uses the formula: c_n = f^(n)(a) / n!
   *
   * Syntax:
   *
   *     math.seriesCoefficient(expr, variable, point, n)
   *
   * Examples:
   *
   *     math.seriesCoefficient('exp(x)', 'x', 0, 3)    // 0.16666... (= 1/6)
   *     math.seriesCoefficient('sin(x)', 'x', 0, 1)    // 1
   *     math.seriesCoefficient('cos(x)', 'x', 0, 2)    // -0.5 (= -1/2)
   *     math.seriesCoefficient('x^2 + x', 'x', 0, 2)  // 1
   *
   * See also:
   *
   *     taylor, series, derivative, factorial
   *
   * @param  {string | Node}  expr      The expression to expand
   * @param  {string}         variable  The expansion variable
   * @param  {number}         point     The expansion point
   * @param  {number}         n         The coefficient index (non-negative integer)
   * @return {number}                   The nth Taylor coefficient
   */
  return typed(name, {
    'string | Node, string, number, number': function (expr, variable, point, n) {
      if (!Number.isInteger(n) || n < 0) {
        throw new Error('seriesCoefficient: n must be a non-negative integer, got ' + n)
      }

      let currentExpr = typeof expr === 'string' ? expr : expr.toString()

      // Differentiate n times
      for (let k = 0; k < n; k++) {
        try {
          currentExpr = derivative(currentExpr, variable).toString()
        } catch (e) {
          throw new Error('seriesCoefficient: could not differentiate expression ' + k + ' times: ' + e.message)
        }
      }

      // Evaluate at the expansion point
      const scope = {}
      scope[variable] = point
      let value
      try {
        value = evaluate(currentExpr, scope)
      } catch (e) {
        throw new Error('seriesCoefficient: could not evaluate expression at point ' + point + ': ' + e.message)
      }

      if (typeof value !== 'number') {
        value = Number(value)
      }

      // Divide by n!
      const fact = Number(factorial(n))
      return value / fact
    }
  })
})
