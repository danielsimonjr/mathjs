import { factory } from '../../utils/factory.js'

const name = 'toRadicals'
const dependencies = ['typed', 'parse', 'simplify']

export const createToRadicals = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Convert common algebraic expressions to explicit radical (root) form.
   * Handles quadratic and cubic roots, and expressions of the form x^(p/q).
   *
   * Syntax:
   *
   *     math.toRadicals(expr)
   *
   * Examples:
   *
   *     math.toRadicals('x^(1/2)')    // 'sqrt(x)'
   *     math.toRadicals('x^(1/3)')    // 'cbrt(x)'
   *     math.toRadicals('x^(2/3)')    // 'cbrt(x^2)'
   *     math.toRadicals('4^(1/2)')    // '2'
   *     math.toRadicals('8^(1/3)')    // '2'
   *
   * See also:
   *
   *     simplify, parse, minimalPolynomial
   *
   * @param  {string | Node}  expr  The expression to convert
   * @return {string}               The radical form as a string
   */
  return typed(name, {
    'string | Node': function (expr) {
      const exprStr = typeof expr === 'string' ? expr : expr.toString()

      let node
      try {
        node = parse(exprStr)
      } catch (e) {
        throw new Error('toRadicals: could not parse expression "' + exprStr + '"')
      }

      const converted = _convertNode(node)
      try {
        return simplify(converted).toString()
      } catch (e) {
        return converted.toString()
      }
    }
  })

  /**
   * Recursively convert power nodes to radical form.
   * @param {Node} node
   * @return {Node}
   */
  function _convertNode (node) {
    if (node.type === 'OperatorNode' && node.op === '^' && node.args.length === 2) {
      const base = _convertNode(node.args[0])
      const exp = node.args[1]

      // x^(p/q) where p, q are integer constants
      if (exp.type === 'OperatorNode' && exp.op === '/' && exp.args.length === 2) {
        const pNode = exp.args[0]
        const qNode = exp.args[1]
        if (pNode.type === 'ConstantNode' && qNode.type === 'ConstantNode') {
          const p = Number(pNode.value)
          const q = Number(qNode.value)

          if (Number.isInteger(p) && Number.isInteger(q) && q > 0) {
            return _buildRadical(base, p, q)
          }
        }
      }

      // x^(1/2) written as x^0.5
      if (exp.type === 'ConstantNode') {
        const val = Number(exp.value)
        if (Math.abs(val - 0.5) < 1e-14) {
          return _buildSqrt(base)
        }
        if (Math.abs(val - 1 / 3) < 1e-14) {
          return _buildCbrt(base)
        }
      }

      return _cloneWithConvertedArgs(node, [base, exp])
    }

    // Recursively process other nodes
    if (node.args && node.args.length > 0) {
      const newArgs = node.args.map(_convertNode)
      return _cloneWithConvertedArgs(node, newArgs)
    }

    return node
  }

  /**
   * Build a radical expression: base^(p/q) → sqrt/cbrt/nthRoot of base^p
   */
  function _buildRadical (base, p, q) {
    if (q === 1) {
      // Integer power, no radical needed
      if (p === 1) return base
      const FunctionNode = base.constructor // get a node class reference via prototype trick
      // We'll just reconstruct as string and re-parse
      const baseStr = base.toString()
      const result = p === 1 ? baseStr : '(' + baseStr + ') ^ ' + p
      try {
        return parse(result)
      } catch (e) {
        return base
      }
    }

    // Compute base^|p| part (the radicand), then invert if p < 0
    const baseStr = base.toString()
    let radicandStr
    if (p === 1 || p === -1) {
      // For p=1 or p=-1, the radicand is just the base itself;
      // the sign of p is handled by the inversion block below.
      radicandStr = baseStr
    } else {
      radicandStr = '(' + baseStr + ') ^ ' + Math.abs(p)
    }

    let radicalStr
    if (q === 2) {
      radicalStr = 'sqrt(' + radicandStr + ')'
    } else if (q === 3) {
      radicalStr = 'cbrt(' + radicandStr + ')'
    } else {
      radicalStr = 'nthRoot(' + radicandStr + ', ' + q + ')'
    }

    if (p < 0) {
      radicalStr = '1 / (' + radicalStr + ')'
    }

    try {
      return parse(radicalStr)
    } catch (e) {
      return parse(baseStr)
    }
  }

  function _buildSqrt (base) {
    try {
      return parse('sqrt(' + base.toString() + ')')
    } catch (e) {
      return base
    }
  }

  function _buildCbrt (base) {
    try {
      return parse('cbrt(' + base.toString() + ')')
    } catch (e) {
      return base
    }
  }

  /**
   * Clone a node but replace its args with converted versions.
   * Uses string-based round-trip for simplicity.
   */
  function _cloneWithConvertedArgs (node, newArgs) {
    // Reconstruct via toString and re-parse if args changed
    // For most node types we can just use node.clone() and mutate
    const cloned = node.clone()
    if (cloned.args) {
      for (let i = 0; i < newArgs.length; i++) {
        cloned.args[i] = newArgs[i]
      }
    }
    return cloned
  }
})
