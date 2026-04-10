import { factory } from '../../utils/factory.js'

const name = 'taylor'
const dependencies = [
  'typed',
  'parse',
  'derivative',
  'evaluate',
  'simplify',
  'factorial'
]

export const createTaylor = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  evaluate,
  simplify,
  factorial
}) => {
  /**
   * Compute the Taylor polynomial expansion of an expression around a point.
   * This is a cleaner alias for `series` that returns only the polynomial string
   * without any remainder term notation.
   *
   * Uses the formula: f(a) + f'(a)(x-a) + f''(a)(x-a)^2/2! + ... + f^(n)(a)(x-a)^n/n!
   *
   * Syntax:
   *
   *     math.taylor(expr, variable, point, order)
   *
   * Examples:
   *
   *     math.taylor('sin(x)', 'x', 0, 5)
   *     math.taylor('exp(x)', 'x', 0, 4)
   *     math.taylor('cos(x)', 'x', 0, 6)
   *
   * See also:
   *
   *     series, derivative, simplify
   *
   * @param {string | Node} expr    The expression to expand
   * @param {string} variable       The expansion variable
   * @param {number} [point=0]      The expansion point (default 0)
   * @param {number} [order=6]      The order of the polynomial (default 6)
   * @return {string}               The Taylor polynomial as a string
   */
  function computeTaylor (expr, variable, point, order) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const a = (point === undefined || point === null) ? 0 : point
    const n = (order === undefined || order === null) ? 6 : order

    const terms = []
    let currentExpr = exprStr

    for (let k = 0; k <= n; k++) {
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
      varPart = power === 1 ? varName : varName + '^' + power
    } else {
      const pointStr = _formatNumber(-point)
      varPart = power === 1
        ? '(' + varName + ' + ' + pointStr + ')'
        : '(' + varName + ' + ' + pointStr + ')^' + power
    }

    if (Math.abs(coeff - 1) < 1e-14) return varPart
    if (Math.abs(coeff + 1) < 1e-14) return '-' + varPart
    return _formatNumber(coeff) + ' * ' + varPart
  }

  function _formatNumber (n) {
    if (Number.isInteger(n)) return String(n)
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
    'string, string': (expr, variable) => computeTaylor(expr, variable, 0, 6),
    'Node, string': (expr, variable) => computeTaylor(expr.toString(), variable, 0, 6),
    'string, string, number': (expr, variable, point) => computeTaylor(expr, variable, point, 6),
    'Node, string, number': (expr, variable, point) => computeTaylor(expr.toString(), variable, point, 6),
    'string, string, number, number': (expr, variable, point, order) => computeTaylor(expr, variable, point, order),
    'Node, string, number, number': (expr, variable, point, order) => computeTaylor(expr.toString(), variable, point, order)
  })
})
