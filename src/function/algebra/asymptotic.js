import { factory } from '../../utils/factory.js'

const name = 'asymptotic'
const dependencies = ['typed', 'parse', 'simplify', 'limit']

export const createAsymptotic = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  limit
}) => {
  /**
   * Find the asymptotic (leading) behavior of an expression as a variable approaches a point.
   * For rational functions this returns the leading term.
   * For polynomials this returns the leading monomial.
   * For other expressions it falls back to computing the limit.
   *
   * Syntax:
   *
   *     math.asymptotic(expr, variable, point)
   *
   * Examples:
   *
   *     math.asymptotic('(x^3 + x) / (x^2 + 1)', 'x', Infinity)  // 'x'
   *     math.asymptotic('3*x^4 + 2*x^2 + 1', 'x', Infinity)      // '3 * x ^ 4'
   *     math.asymptotic('exp(x)', 'x', 0)                         // '1'
   *
   * See also:
   *
   *     limit, simplify, derivative
   *
   * @param  {string | Node}  expr      The expression
   * @param  {string}         variable  The variable name
   * @param  {number}         point     The point to approach (use Infinity for infinity)
   * @return {string | number}          The leading behavior as a string or number
   */
  return typed(name, {
    'string | Node, string, number': function (expr, variable, point) {
      const exprStr = typeof expr === 'string' ? expr : expr.toString()

      // Try to detect rational function: numerator / denominator
      let node
      try {
        node = parse(exprStr)
      } catch (e) {
        throw new Error('asymptotic: could not parse expression "' + exprStr + '"')
      }

      if (point === Infinity || point === -Infinity) {
        // Try rational function detection (unwrap any top-level parentheses)
        const innerNode = _unwrapParens(node)
        if (innerNode.type === 'OperatorNode' && innerNode.op === '/') {
          const numStr = innerNode.args[0].toString()
          const denStr = innerNode.args[1].toString()
          const numLeading = _leadingMonomial(numStr, variable)
          const denLeading = _leadingMonomial(denStr, variable)
          if (numLeading !== null && denLeading !== null) {
            const simplified = simplify('(' + numLeading + ') / (' + denLeading + ')')
            return simplified.toString()
          }
        }

        // Try polynomial leading term
        const leading = _leadingMonomial(exprStr, variable)
        if (leading !== null) {
          return leading
        }
      }

      // Fall back to limit
      try {
        const result = limit(exprStr, variable, point)
        return result
      } catch (e) {
        throw new Error('asymptotic: could not determine asymptotic behavior of "' + exprStr + '" as ' + variable + ' -> ' + point)
      }
    }
  })

  /**
   * Unwrap a ParenthesisNode (one layer).
   * @param {Node} node
   * @return {Node}
   */
  function _unwrapParens (node) {
    if (node.type === 'ParenthesisNode') return node.content
    return node
  }

  /**
   * Extract the leading monomial of a polynomial in the given variable.
   * Returns null if the expression cannot be parsed as a polynomial.
   * @param {string} exprStr
   * @param {string} variable
   * @return {string | null}
   */
  function _leadingMonomial (exprStr, variable) {
    // Collect polynomial terms by inspecting the AST
    try {
      const node = parse(exprStr)
      const terms = _collectTerms(node, variable)
      if (terms === null) return null

      // Sort by degree descending
      terms.sort(function (a, b) { return b.degree - a.degree })
      if (terms.length === 0) return null

      const top = terms[0]
      return _termToString(top, variable)
    } catch (e) {
      return null
    }
  }

  /**
   * Collect polynomial terms from an AST node.
   * Returns array of {coeff, degree} or null if not a polynomial.
   */
  function _collectTerms (node, variable) {
    if (node.type === 'ParenthesisNode') {
      return _collectTerms(node.content, variable)
    }

    if (node.type === 'OperatorNode' && node.op === '+') {
      const left = _collectTerms(node.args[0], variable)
      const right = _collectTerms(node.args[1], variable)
      if (left === null || right === null) return null
      return left.concat(right)
    }

    if (node.type === 'OperatorNode' && node.op === '-' && node.args.length === 2) {
      const left = _collectTerms(node.args[0], variable)
      const right = _collectTerms(node.args[1], variable)
      if (left === null || right === null) return null
      return left.concat(right.map(function (t) { return { coeff: -t.coeff, degree: t.degree } }))
    }

    if (node.type === 'OperatorNode' && node.op === '-' && node.args.length === 1) {
      const inner = _collectTerms(node.args[0], variable)
      if (inner === null) return null
      return inner.map(function (t) { return { coeff: -t.coeff, degree: t.degree } })
    }

    const term = _parseTerm(node, variable)
    if (term === null) return null
    return [term]
  }

  /**
   * Parse a single term node into {coeff, degree}.
   */
  function _parseTerm (node, variable) {
    if (node.type === 'ParenthesisNode') {
      return _parseTerm(node.content, variable)
    }

    // Constant
    if (node.type === 'ConstantNode') {
      return { coeff: Number(node.value), degree: 0 }
    }

    // Variable itself
    if (node.type === 'SymbolNode') {
      if (node.name === variable) return { coeff: 1, degree: 1 }
      return { coeff: 1, degree: 0 } // treat as constant coefficient symbol
    }

    // x^n
    if (node.type === 'OperatorNode' && node.op === '^') {
      const base = node.args[0]
      const exp = node.args[1]
      if (base.type === 'SymbolNode' && base.name === variable && exp.type === 'ConstantNode') {
        return { coeff: 1, degree: Number(exp.value) }
      }
      return null
    }

    // c * x^n or c * x
    if (node.type === 'OperatorNode' && node.op === '*') {
      const a = node.args[0]
      const b = node.args[1]

      const termA = _parseTerm(a, variable)
      const termB = _parseTerm(b, variable)
      if (termA !== null && termB !== null) {
        return { coeff: termA.coeff * termB.coeff, degree: termA.degree + termB.degree }
      }
      return null
    }

    // c / d (constant division)
    if (node.type === 'OperatorNode' && node.op === '/') {
      const num = _parseTerm(node.args[0], variable)
      const den = _parseTerm(node.args[1], variable)
      if (num !== null && den !== null && den.degree === 0 && den.coeff !== 0) {
        return { coeff: num.coeff / den.coeff, degree: num.degree }
      }
      return null
    }

    return null
  }

  /**
   * Convert a term {coeff, degree} back to a string.
   */
  function _termToString (term, variable) {
    const c = term.coeff
    const d = term.degree

    if (d === 0) return String(c)

    const varPart = d === 1 ? variable : variable + ' ^ ' + d

    if (Math.abs(c - 1) < 1e-14) return varPart
    if (Math.abs(c + 1) < 1e-14) return '-' + varPart
    return c + ' * ' + varPart
  }
})
