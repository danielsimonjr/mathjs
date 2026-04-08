import { factory } from '../../utils/factory.js'

const name = 'limit'
const dependencies = [
  'typed',
  'parse',
  'evaluate',
  'derivative',
  'simplify'
]

export const createLimit = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate,
  derivative,
  simplify
}) => {
  /**
   * Compute the limit of an expression as a variable approaches a value.
   * Uses direct substitution first; for indeterminate 0/0 forms applies
   * L'Hopital's rule using the derivative function.
   *
   * Syntax:
   *
   *     math.limit(expr, variable, value)
   *
   * Examples:
   *
   *     math.limit('sin(x) / x', 'x', 0)
   *     math.limit('(x^2 - 1) / (x - 1)', 'x', 1)
   *     math.limit('x^2 + 3*x', 'x', 2)
   *
   * See also:
   *
   *     derivative, evaluate, simplify
   *
   * @param {string} expr        The expression to evaluate the limit of
   * @param {string} variable    The variable approaching the value
   * @param {number} value       The value the variable approaches
   * @return {number}            The limit value
   */
  function computeLimit (expr, variable, value) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const isInfinity = value === Infinity || value === -Infinity

    if (!isInfinity) {
      // Try direct substitution
      const direct = _trySubstitute(exprStr, varName, value)
      if (direct !== null && isFinite(direct)) {
        return direct
      }

      // Numerical approach: average from both sides
      const epsilon = 1e-8
      const leftVal = _trySubstitute(exprStr, varName, value - epsilon)
      const rightVal = _trySubstitute(exprStr, varName, value + epsilon)

      if (leftVal !== null && rightVal !== null && isFinite(leftVal) && isFinite(rightVal)) {
        return Math.round(((leftVal + rightVal) / 2) * 1e10) / 1e10
      }

      // Try L'Hopital's rule for rational 0/0 forms
      try {
        const node = parse(exprStr)
        if (node.isOperatorNode && node.op === '/' && node.isBinary()) {
          const num = node.args[0]
          const den = node.args[1]
          const numVal = _trySubstitute(num.toString(), varName, value)
          const denVal = _trySubstitute(den.toString(), varName, value)

          if (numVal !== null && denVal !== null &&
              Math.abs(numVal) < 1e-8 && Math.abs(denVal) < 1e-8) {
            const dNum = derivative(num.toString(), varName).toString()
            const dDen = derivative(den.toString(), varName).toString()
            return computeLimit('(' + dNum + ') / (' + dDen + ')', varName, value)
          }
        }
      } catch (e) {
        // fall through
      }
    }

    if (isInfinity) {
      const sign = value > 0 ? 1 : -1
      const largeVal = sign * 1e15
      const result = _trySubstitute(exprStr, varName, largeVal)
      if (result !== null) {
        if (!isFinite(result)) return result
        return Math.round(result * 1e10) / 1e10
      }
    }

    throw new Error('limit: cannot compute limit of "' + exprStr + '" as ' + varName + ' -> ' + value)
  }

  function _trySubstitute (exprStr, varName, value) {
    try {
      const scope = {}
      scope[varName] = value
      const result = evaluate(exprStr, scope)
      if (typeof result === 'number') return result
      if (typeof result === 'object' && result !== null && typeof result.toNumber === 'function') {
        return result.toNumber()
      }
      return null
    } catch (e) {
      return null
    }
  }

  return typed(name, {
    'string, string, number': function (expr, variable, value) {
      return computeLimit(expr, variable, value)
    },
    'Node, string, number': function (expr, variable, value) {
      return computeLimit(expr.toString(), variable, value)
    }
  })
})
