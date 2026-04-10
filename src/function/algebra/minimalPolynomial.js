import { factory } from '../../utils/factory.js'

const name = 'minimalPolynomial'
const dependencies = ['typed', 'parse', 'simplify']

export const createMinimalPolynomial = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Find the minimal polynomial of a simple algebraic expression.
   * Handles single radicals like sqrt(n) and cbrt(n), and sums of two square roots.
   * The minimal polynomial is the monic polynomial with rational coefficients of smallest
   * degree for which the expression is a root.
   *
   * Syntax:
   *
   *     math.minimalPolynomial(expr, variable)
   *
   * Examples:
   *
   *     math.minimalPolynomial('sqrt(2)', 'x')         // 'x ^ 2 - 2'
   *     math.minimalPolynomial('cbrt(3)', 'x')         // 'x ^ 3 - 3'
   *     math.minimalPolynomial('sqrt(2) + sqrt(3)', 'x') // 'x ^ 4 - 10 * x ^ 2 + 1'
   *
   * See also:
   *
   *     simplify, parse
   *
   * @param  {string | Node}  expr      The algebraic expression (a numeric constant)
   * @param  {string}         variable  The polynomial variable name
   * @return {string}                   The minimal polynomial as a string
   */
  return typed(name, {
    'string | Node, string': function (expr, variable) {
      const exprStr = typeof expr === 'string' ? expr : expr.toString()
      const v = variable

      // Try to parse as a simple expression and determine minimal polynomial
      let node
      try {
        node = parse(exprStr)
      } catch (e) {
        throw new Error('minimalPolynomial: could not parse expression "' + exprStr + '"')
      }

      // Case 1: sqrt(n) — minimal polynomial: v^2 - n
      const sqrtMatch = _matchSqrt(node)
      if (sqrtMatch !== null) {
        const n = sqrtMatch
        const sign = n >= 0 ? ' - ' : ' + '
        return v + ' ^ 2' + sign + Math.abs(n)
      }

      // Case 2: cbrt(n) — minimal polynomial: v^3 - n
      const cbrtMatch = _matchCbrt(node)
      if (cbrtMatch !== null) {
        const n = cbrtMatch
        const sign = n >= 0 ? ' - ' : ' + '
        return v + ' ^ 3' + sign + Math.abs(n)
      }

      // Case 3: nthRoot(n, k) — minimal polynomial: v^k - n
      const nthRootMatch = _matchNthRoot(node)
      if (nthRootMatch !== null) {
        const { radicand, index } = nthRootMatch
        const sign = radicand >= 0 ? ' - ' : ' + '
        return v + ' ^ ' + index + sign + Math.abs(radicand)
      }

      // Case 4: sqrt(a) + sqrt(b)
      // alpha = sqrt(a) + sqrt(b): minimal poly = v^4 - 2(a+b)*v^2 + (a-b)^2
      const sumSqrtMatch = _matchSumOfSqrts(node)
      if (sumSqrtMatch !== null) {
        const { a, b } = sumSqrtMatch
        const coeff2 = 2 * (a + b)
        const coeff0 = (a - b) * (a - b)
        const sign2 = coeff2 >= 0 ? ' - ' : ' + '
        const sign0 = coeff0 >= 0 ? ' + ' : ' - '
        return v + ' ^ 4' + sign2 + Math.abs(coeff2) + ' * ' + v + ' ^ 2' + sign0 + Math.abs(coeff0)
      }

      // Case 5: rational number — minimal poly is v - p/q
      const ratMatch = _matchRational(node)
      if (ratMatch !== null) {
        if (ratMatch === 0) return v
        const sign = ratMatch >= 0 ? ' - ' : ' + '
        return v + sign + Math.abs(ratMatch)
      }

      throw new Error(
        'minimalPolynomial: unsupported expression "' + exprStr + '". ' +
        'Supported forms: sqrt(n), cbrt(n), nthRoot(n, k), sqrt(a) + sqrt(b), rational constants.'
      )
    }
  })

  /** Match sqrt(n) where n is a numeric constant. Returns n or null. */
  function _matchSqrt (node) {
    if (node.type === 'FunctionNode' && node.fn.name === 'sqrt' && node.args.length === 1) {
      const arg = node.args[0]
      if (arg.type === 'ConstantNode') return Number(arg.value)
      // Handle negative: sqrt(-n) would be imaginary, skip
    }
    return null
  }

  /** Match cbrt(n). Returns n or null. */
  function _matchCbrt (node) {
    if (node.type === 'FunctionNode' && node.fn.name === 'cbrt' && node.args.length === 1) {
      const arg = node.args[0]
      if (arg.type === 'ConstantNode') return Number(arg.value)
    }
    return null
  }

  /** Match nthRoot(n, k). Returns {radicand, index} or null. */
  function _matchNthRoot (node) {
    if (node.type === 'FunctionNode' && node.fn.name === 'nthRoot' && node.args.length === 2) {
      const radicandNode = node.args[0]
      const indexNode = node.args[1]
      if (radicandNode.type === 'ConstantNode' && indexNode.type === 'ConstantNode') {
        return { radicand: Number(radicandNode.value), index: Number(indexNode.value) }
      }
    }
    return null
  }

  /** Match sqrt(a) + sqrt(b). Returns {a, b} or null. */
  function _matchSumOfSqrts (node) {
    if (node.type === 'OperatorNode' && node.op === '+' && node.args.length === 2) {
      const left = _matchSqrt(node.args[0])
      const right = _matchSqrt(node.args[1])
      if (left !== null && right !== null) {
        return { a: left, b: right }
      }
    }
    return null
  }

  /** Match a rational number constant (integer or fraction). Returns number or null. */
  function _matchRational (node) {
    if (node.type === 'ConstantNode') return Number(node.value)
    if (node.type === 'OperatorNode' && node.op === '/' && node.args.length === 2) {
      const num = node.args[0]
      const den = node.args[1]
      if (num.type === 'ConstantNode' && den.type === 'ConstantNode') {
        return Number(num.value) / Number(den.value)
      }
    }
    return null
  }
})
