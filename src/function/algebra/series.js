import { factory } from '../../utils/factory.js'

const name = 'series'
const dependencies = [
  'typed',
  'parse',
  'evaluate',
  'derivative',
  'simplify',
  'factorial'
]

export const createSeries = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate,
  derivative,
  simplify,
  factorial
}) => {
  /**
   * Compute the Taylor series expansion of an expression around a point.
   * Uses the formula: f(a) + f'(a)(x-a) + f''(a)(x-a)^2/2! + ...
   *
   * Syntax:
   *
   *     math.series(expr, variable, point, order)
   *
   * Examples:
   *
   *     math.series('exp(x)', 'x', 0, 4)
   *     math.series('sin(x)', 'x', 0, 5)
   *     math.series('cos(x)', 'x', 0, 4)
   *
   * See also:
   *
   *     derivative, evaluate, simplify
   *
   * @param {string | Node} expr   The expression to expand
   * @param {string} variable      The expansion variable
   * @param {number} [point=0]     The expansion point
   * @param {number} [order=6]     The order of the expansion
   * @return {string}              The Taylor series as a string
   */
  function computeSeries (expr, variable, point, order) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const a = (point === undefined || point === null) ? 0 : point
    const n = (order === undefined || order === null) ? 6 : order

    const terms = []
    let currentExpr = exprStr

    for (let k = 0; k <= n; k++) {
      // Evaluate the k-th derivative at point a
      const scope = {}
      scope[varName] = a
      let coeff
      try {
        coeff = evaluate(currentExpr, scope)
      } catch (e) {
        coeff = 0
      }

      if (typeof coeff !== 'number') {
        try {
          coeff = Number(coeff)
        } catch (e) {
          coeff = 0
        }
      }

      const fact = Number(factorial(k))
      const termCoeff = coeff / fact

      if (Math.abs(termCoeff) > 1e-14) {
        const term = _buildTerm(termCoeff, varName, a, k)
        if (term !== null) terms.push(term)
      }

      // Differentiate for next iteration
      if (k < n) {
        try {
          currentExpr = derivative(currentExpr, varName).toString()
        } catch (e) {
          break
        }
      }
    }

    if (terms.length === 0) return '0'
    return terms.join(' + ').replace(/\+ -/g, '- ')
  }

  function _buildTerm (coeff, varName, point, power) {
    const isPoint0 = Math.abs(point) < 1e-14

    if (power === 0) {
      return _formatNumber(coeff)
    }

    let varPart
    if (isPoint0) {
      if (power === 1) {
        varPart = varName
      } else {
        varPart = varName + '^' + power
      }
    } else {
      const pointStr = _formatNumber(-point)
      if (power === 1) {
        varPart = '(' + varName + ' + ' + pointStr + ')'
      } else {
        varPart = '(' + varName + ' + ' + pointStr + ')^' + power
      }
    }

    if (Math.abs(coeff - 1) < 1e-14) {
      return varPart
    }
    if (Math.abs(coeff + 1) < 1e-14) {
      return '-' + varPart
    }

    return _formatNumber(coeff) + ' * ' + varPart
  }

  function _formatNumber (n) {
    if (Number.isInteger(n)) return String(n)
    // Express as fraction if possible
    for (let denom = 1; denom <= 1000; denom++) {
      const num = Math.round(n * denom)
      if (Math.abs(num / denom - n) < 1e-12) {
        if (denom === 1) return String(num)
        return num + ' / ' + denom
      }
    }
    return String(n)
  }

  return typed(name, {
    'string, string': function (expr, variable) { return computeSeries(expr, variable, 0, 6) },
    'Node, string': function (expr, variable) { return computeSeries(expr.toString(), variable, 0, 6) },
    'string, string, number': function (expr, variable, point) { return computeSeries(expr, variable, point, 6) },
    'Node, string, number': function (expr, variable, point) { return computeSeries(expr.toString(), variable, point, 6) },
    'string, string, number, number': function (expr, variable, point, order) { return computeSeries(expr, variable, point, order) },
    'Node, string, number, number': function (expr, variable, point, order) { return computeSeries(expr.toString(), variable, point, order) }
  })
})
