import { factory } from '../../utils/factory.js'

const name = 'piecewise'
const dependencies = ['typed', 'parse', 'evaluate']

export const createPiecewise = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate
}) => {
  /**
   * Build and evaluate a piecewise-defined expression.
   *
   * Given an array of [condition, value] pairs and a default value, evaluates
   * each condition in order and returns the value of the first true condition,
   * or the default value if none match.
   *
   * Conditions and values may be expression strings or numbers.
   * When a scope is provided, conditions are evaluated with that scope.
   *
   * Syntax:
   *
   *     math.piecewise(pairs, defaultValue)
   *     math.piecewise(pairs, defaultValue, scope)
   *
   * Examples:
   *
   *     math.piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: 5})
   *     math.piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: -3})
   *     math.piecewise([["x > 0", "x"], ["x < 0", "-x"]], "0", {x: 0})
   *
   * See also:
   *
   *     evaluate, parse, simplify
   *
   * @param {Array}         pairs          Array of [condition, value] pairs
   * @param {string|number} defaultValue   Value when no condition matches
   * @param {Object}        [scope]        Variable scope for evaluation
   * @return {number|string}               The matched value or defaultValue
   */
  return typed(name, {
    'Array, any': function (pairs, defaultValue) {
      return _evaluate(pairs, defaultValue, {})
    },
    'Array, any, Object': function (pairs, defaultValue, scope) {
      return _evaluate(pairs, defaultValue, scope)
    }
  })

  function _evaluate (pairs, defaultValue, scope) {
    for (const pair of pairs) {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error('piecewise: each pair must be [condition, value]')
      }
      const [condition, value] = pair
      const condResult = _evalExpr(condition, scope)
      if (condResult) {
        return _evalExpr(value, scope)
      }
    }
    return _evalExpr(defaultValue, scope)
  }

  function _evalExpr (expr, scope) {
    if (typeof expr === 'number') return expr
    if (typeof expr === 'string') {
      try {
        return evaluate(expr, scope)
      } catch (e) {
        // If evaluation fails (e.g. symbolic), return as string
        return expr
      }
    }
    return expr
  }
})
