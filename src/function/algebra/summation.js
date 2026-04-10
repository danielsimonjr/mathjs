import { factory } from '../../utils/factory.js'

const name = 'summation'
const dependencies = [
  'typed',
  'parse',
  'evaluate',
  'simplify'
]

export const createSummation = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  evaluate,
  simplify
}) => {
  /**
   * Compute the summation of an expression over a variable from start to end.
   * Attempts closed-form evaluation for common patterns, falls back to numeric.
   *
   * Supported closed forms:
   *   - sum(k, k=a..b)   = b*(b+1)/2 - (a-1)*a/2   (arithmetic)
   *   - sum(k^2, k=1..n) = n*(n+1)*(2*n+1)/6
   *   - sum(r^k, k=0..n) = (1 - r^(n+1))/(1 - r)   (geometric)
   *
   * For unrecognized patterns, evaluates numerically.
   *
   * Syntax:
   *
   *     math.summation(expr, variable, start, end)
   *
   * Examples:
   *
   *     math.summation('k', 'k', 1, 100)
   *     math.summation('k^2', 'k', 1, 10)
   *     math.summation('1/k', 'k', 1, 5)
   *
   * See also:
   *
   *     product, evaluate
   *
   * @param {string | Node} expr   The summand expression
   * @param {string} variable      The summation index variable
   * @param {number} start         The lower bound (integer)
   * @param {number} end           The upper bound (integer)
   * @return {number | string}     The sum (number for numeric, string for closed-form)
   */
  function computeSummation (expr, variable, start, end) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name
    const a = Math.round(start)
    const b = Math.round(end)

    // Try closed-form pattern matching first
    const closed = _tryClosedForm(exprStr, varName, a, b)
    if (closed !== null) return closed

    // Fall back to numeric summation
    return _numericSum(exprStr, varName, a, b)
  }

  function _tryClosedForm (exprStr, varName, a, b) {
    const normalized = exprStr.replace(/\s+/g, '')
    const v = varName

    // sum(k, k=a..b) = (a+b)*(b-a+1)/2
    if (normalized === v) {
      const n = b - a + 1
      return (a + b) * n / 2
    }

    // sum(k^2, k=1..n) — only valid from 1..n
    if ((normalized === v + '^2' || normalized === v + '*' + v) && a === 1) {
      const n = b
      return n * (n + 1) * (2 * n + 1) / 6
    }

    // sum(k^3, k=1..n) = (n*(n+1)/2)^2
    if (normalized === v + '^3' && a === 1) {
      const n = b
      const half = n * (n + 1) / 2
      return half * half
    }

    // sum(r^k, k=0..n) — geometric series, detect by checking if expr has no v additive term
    // Pattern: expr matches /^[\d.]+\^v$/ or /^v$/ being interpreted as r=variable? No —
    // We only handle literal constant^k patterns. Detect numerically: check if a=0 and expr is c^k form.
    if (a === 0) {
      const geomMatch = normalized.match(/^([^+\-*/]+)\^/)
      if (geomMatch) {
        const base = geomMatch[1]
        // Check if base doesn't contain the variable
        if (!base.includes(v)) {
          try {
            let r = Number(evaluate(base, {}))
            if (isFinite(r) && Math.abs(r - 1) > 1e-10) {
              // geometric: (1 - r^(n+1)) / (1 - r)
              return (1 - Math.pow(r, b + 1)) / (1 - r)
            } else if (Math.abs(r - 1) < 1e-10) {
              return b + 1 // sum of 1^k = n+1 terms
            }
          } catch (e) {
            // not a constant base
          }
        }
      }
    }

    return null
  }

  function _numericSum (exprStr, varName, a, b) {
    let sum = 0
    for (let k = a; k <= b; k++) {
      const scope = {}
      scope[varName] = k
      try {
        const val = evaluate(exprStr, scope)
        sum += Number(val)
      } catch (e) {
        // skip undefined values
      }
    }
    return sum
  }

  return typed(name, {
    'string, string, number, number': (expr, variable, start, end) =>
      computeSummation(expr, variable, start, end),
    'Node, string, number, number': (expr, variable, start, end) =>
      computeSummation(expr.toString(), variable, start, end)
  })
})
