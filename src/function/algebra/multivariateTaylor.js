import { factory } from '../../utils/factory.js'

const name = 'multivariateTaylor'
const dependencies = ['typed', 'parse', 'derivative', 'evaluate', 'factorial', 'simplify']

export const createMultivariateTaylor = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  evaluate,
  factorial,
  simplify
}) => {
  /**
   * Compute the multivariate Taylor series expansion of a scalar expression.
   * Uses partial derivatives: f(a + h, b + k) = f + h*fx + k*fy + (h²fxx + 2hk*fxy + k²fyy)/2 + ...
   *
   * Syntax:
   *
   *     math.multivariateTaylor(expr, variables, points, order)
   *
   * Examples:
   *
   *     math.multivariateTaylor('exp(x + y)', ['x', 'y'], [0, 0], 2)
   *     math.multivariateTaylor('x * y', ['x', 'y'], [1, 1], 2)
   *     math.multivariateTaylor('sin(x) * cos(y)', ['x', 'y'], [0, 0], 3)
   *
   * See also:
   *
   *     taylor, series, derivative, factorial
   *
   * @param  {string | Node}   expr       The scalar expression to expand
   * @param  {Array.<string>}  variables  Array of variable names
   * @param  {Array.<number>}  points     Array of expansion points (same length as variables)
   * @param  {number}          order      The order of the expansion
   * @return {string}                     The Taylor polynomial as a string
   */
  return typed(name, {
    'string | Node, Array, Array, number': function (expr, variables, points, order) {
      if (variables.length !== points.length) {
        throw new Error('multivariateTaylor: variables and points arrays must have the same length')
      }

      const exprStr = typeof expr === 'string' ? expr : expr.toString()
      const nvars = variables.length

      const terms = []

      // Enumerate all multi-indices alpha = (k1, k2, ..., kn) with |alpha| = k1+...+kn <= order
      const multiIndices = _generateMultiIndices(nvars, order)

      for (const alpha of multiIndices) {
        const totalOrder = alpha.reduce(function (s, k) { return s + k }, 0)

        // Compute mixed partial derivative d^|alpha|f / dx1^k1 dx2^k2 ...
        let currentExpr = exprStr
        let canDiff = true

        for (let varIdx = 0; varIdx < nvars; varIdx++) {
          for (let k = 0; k < alpha[varIdx]; k++) {
            try {
              currentExpr = derivative(currentExpr, variables[varIdx]).toString()
            } catch (e) {
              canDiff = false
              break
            }
          }
          if (!canDiff) break
        }

        if (!canDiff) continue

        // Evaluate the partial derivative at the expansion point
        const scope = {}
        for (let i = 0; i < nvars; i++) {
          scope[variables[i]] = points[i]
        }

        let value
        try {
          value = evaluate(currentExpr, scope)
        } catch (e) {
          continue
        }

        if (typeof value !== 'number') {
          value = Number(value)
        }

        if (!isFinite(value) || Math.abs(value) < 1e-14) continue

        // Divide by (k1! * k2! * ... * kn!)
        let factProduct = 1
        for (const k of alpha) {
          factProduct *= Number(factorial(k))
        }

        const coeff = value / factProduct

        if (Math.abs(coeff) < 1e-14) continue

        // Build the monomial: prod_i (xi - ai)^ki
        const monomialParts = []
        for (let i = 0; i < nvars; i++) {
          if (alpha[i] === 0) continue
          const diff = points[i] === 0
            ? variables[i]
            : '(' + variables[i] + ' - ' + points[i] + ')'
          monomialParts.push(alpha[i] === 1 ? diff : diff + '^' + alpha[i])
        }

        const monomial = monomialParts.length === 0 ? '1' : monomialParts.join(' * ')

        let term
        if (monomialParts.length === 0) {
          // Constant term
          term = _formatCoeff(coeff)
        } else if (Math.abs(coeff - 1) < 1e-14) {
          term = monomial
        } else if (Math.abs(coeff + 1) < 1e-14) {
          term = '-' + monomial
        } else {
          term = _formatCoeff(coeff) + ' * ' + monomial
        }

        terms.push({ totalOrder, coeff, term })
      }

      if (terms.length === 0) return '0'

      // Sort terms by total order for readability
      terms.sort(function (a, b) { return a.totalOrder - b.totalOrder || 0 })

      const termStrings = terms.map(function (t) { return t.term })
      return termStrings.join(' + ').replace(/\+ -/g, '- ')
    }
  })

  /**
   * Generate all multi-indices (k1, ..., kn) with ki >= 0 and sum <= maxOrder.
   * @param {number} n         Number of variables
   * @param {number} maxOrder  Maximum total order
   * @return {Array.<Array.<number>>}
   */
  function _generateMultiIndices (n, maxOrder) {
    const result = []
    const current = new Array(n).fill(0)

    function recurse (varIdx, remaining) {
      if (varIdx === n - 1) {
        for (let k = 0; k <= remaining; k++) {
          current[varIdx] = k
          result.push(current.slice())
        }
        return
      }
      for (let k = 0; k <= remaining; k++) {
        current[varIdx] = k
        recurse(varIdx + 1, remaining - k)
      }
    }

    recurse(0, maxOrder)
    return result
  }

  /**
   * Format a coefficient as a string (fraction when possible).
   * @param {number} c
   * @return {string}
   */
  function _formatCoeff (c) {
    if (Number.isInteger(c)) return String(c)
    for (let denom = 2; denom <= 1000; denom++) {
      const num = Math.round(c * denom)
      if (Math.abs(num / denom - c) < 1e-12) {
        return num + ' / ' + denom
      }
    }
    return String(c)
  }
})
