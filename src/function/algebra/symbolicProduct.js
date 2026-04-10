import { factory } from '../../utils/factory.js'

const name = 'symbolicProduct'
const dependencies = [
  'typed',
  'parse',
  'evaluate'
]

export const createSymbolicProduct = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate
}) => {
  /**
   * Compute the product of an expression over a variable from start to end.
   * Attempts closed-form evaluation for common patterns, falls back to numeric.
   *
   * Supported closed forms:
   *   - product(k, k=1..n) = n! (factorial)
   *   - product(k, k=a..b) = b! / (a-1)!  (partial factorial)
   *   - product(c, k=a..b) = c^(b-a+1)    (constant product)
   *
   * For unrecognized patterns, evaluates numerically.
   *
   * Syntax:
   *
   *     math.symbolicProduct(expr, variable, start, end)
   *
   * Examples:
   *
   *     math.symbolicProduct('k', 'k', 1, 5)
   *     math.symbolicProduct('k', 'k', 3, 7)
   *     math.symbolicProduct('2', 'k', 1, 10)
   *
   * See also:
   *
   *     summation, evaluate
   *
   * @param {string | Node} expr   The multiplicand expression
   * @param {string} variable      The product index variable
   * @param {number} start         The lower bound (integer)
   * @param {number} end           The upper bound (integer)
   * @return {number}              The product
   */
  function computeSymbolicProduct (expr, variable, start, end) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const a = Math.round(start)
    const b = Math.round(end)

    // Try closed-form pattern matching first
    const closed = _tryClosedForm(exprStr, varName, a, b)
    if (closed !== null) return closed

    // Fall back to numeric product
    return _numericProduct(exprStr, varName, a, b)
  }

  function _tryClosedForm (exprStr, varName, a, b) {
    const normalized = exprStr.replace(/\s+/g, '')
    const v = varName

    // product(k, k=1..n) = n!
    if (normalized === v && a === 1) {
      return _factorial(b)
    }

    // product(k, k=a..b) = b! / (a-1)!
    if (normalized === v && a > 1) {
      return _factorial(b) / _factorial(a - 1)
    }

    // Check if expr is a constant (no variable)
    if (!normalized.includes(v)) {
      try {
        const c = Number(evaluate(normalized, {}))
        if (isFinite(c)) {
          const n = b - a + 1
          return Math.pow(c, n)
        }
      } catch (e) {
        // not a constant
      }
    }

    return null
  }

  function _factorial (n) {
    if (n <= 0) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  function _numericProduct (exprStr, varName, a, b) {
    let product = 1
    for (let k = a; k <= b; k++) {
      const scope = {}
      scope[varName] = k
      try {
        const val = evaluate(exprStr, scope)
        product *= Number(val)
      } catch (e) {
        // skip undefined values
      }
    }
    return product
  }

  return typed(name, {
    'string, string, number, number': (expr, variable, start, end) =>
      computeSymbolicProduct(expr, variable, start, end),
    'Node, string, number, number': (expr, variable, start, end) =>
      computeSymbolicProduct(expr.toString(), variable, start, end)
  })
})
