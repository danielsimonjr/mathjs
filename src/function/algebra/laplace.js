import { factory } from '../../utils/factory.js'

const name = 'laplace'
const dependencies = [
  'typed',
  'parse',
  'simplify'
]

export const createLaplace = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute the Laplace transform of an expression using a lookup table.
   * Supports common patterns: constants, t^n, e^(at), sin(bt), cos(bt),
   * and products of t with these (via differentiation of the transform).
   *
   * Syntax:
   *
   *     math.laplace(expr, tVar, sVar)
   *
   * Examples:
   *
   *     math.laplace('1', 't', 's')
   *     math.laplace('t^2', 't', 's')
   *     math.laplace('sin(t)', 't', 's')
   *     math.laplace('exp(2*t)', 't', 's')
   *
   * See also:
   *
   *     derivative, simplify
   *
   * @param {string | Node} expr  The time-domain expression
   * @param {string} tVar         The time variable name
   * @param {string} sVar         The frequency variable name
   * @return {string}             The Laplace transform in s
   */
  function computeLaplace (expr, tVar, sVar) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const t = typeof tVar === 'string' ? tVar : tVar.name
    const s = typeof sVar === 'string' ? sVar : sVar.name

    const node = parse(exprStr)
    const result = _transform(node, t, s)
    return simplify(result).toString()
  }

  function _transform (node, t, s) {
    // Remove parentheses
    if (node.isParenthesisNode) {
      return _transform(node.content, t, s)
    }

    // Constant: L{c} = c/s
    if (node.isConstantNode) {
      const c = Number(node.value)
      if (Math.abs(c - 1) < 1e-12) {
        return '1 / ' + s
      }
      return c + ' / ' + s
    }

    // Symbol: t -> 1/s^2, other symbols treated as constants * 1
    if (node.isSymbolNode) {
      if (node.name === t) {
        // L{t} = 1/s^2
        return '1 / ' + s + '^2'
      }
      // Treat as a constant parameter
      return node.name + ' / ' + s
    }

    // Operator nodes
    if (node.isOperatorNode) {
      return _transformOperator(node, t, s)
    }

    // Function nodes
    if (node.isFunctionNode) {
      return _transformFunction(node, t, s)
    }

    throw new Error('laplace: unsupported expression: ' + node.toString())
  }

  function _transformOperator (node, t, s) {
    // Linearity: L{f + g} = L{f} + L{g}, L{f - g} = L{f} - L{g}
    if (node.op === '+' || node.op === '-') {
      if (node.isBinary()) {
        const Lf = _transform(node.args[0], t, s)
        const Lg = _transform(node.args[1], t, s)
        return '(' + Lf + ')' + ' ' + node.op + ' (' + Lg + ')'
      }
      if (node.isUnary() && node.op === '-') {
        return '-(' + _transform(node.args[0], t, s) + ')'
      }
    }

    // Scaling: L{c * f} = c * L{f}
    if (node.op === '*' && node.isBinary()) {
      const left = node.args[0]
      const right = node.args[1]
      const leftIsConst = !_containsVar(left, t)
      const rightIsConst = !_containsVar(right, t)

      if (leftIsConst) {
        return left.toString() + ' * (' + _transform(right, t, s) + ')'
      }
      if (rightIsConst) {
        return right.toString() + ' * (' + _transform(left, t, s) + ')'
      }

      // t * f(t) -> -d/ds L{f}
      if (left.isSymbolNode && left.name === t) {
        return _multiplyByT(_transform(right, t, s), s)
      }
      if (right.isSymbolNode && right.name === t) {
        return _multiplyByT(_transform(left, t, s), s)
      }

      // t^n * f(t): handle t^n
      if (left.isOperatorNode && left.op === '^' && left.args[0].isSymbolNode && left.args[0].name === t) {
        const n = left.args[1]
        if (n.isConstantNode) {
          // L{t^n * f(t)} = (-1)^n * d^n/ds^n L{f(t)}
          const nVal = Number(n.value)
          const Lf = _transform(right, t, s)
          return _differentiateTransformN(Lf, s, nVal)
        }
      }
    }

    // Power: t^n -> n!/s^(n+1)
    if (node.op === '^' && node.isBinary()) {
      const base = node.args[0]
      const exp = node.args[1]
      if (base.isSymbolNode && base.name === t && exp.isConstantNode) {
        const n = Number(exp.value)
        if (Number.isInteger(n) && n >= 0) {
          const fact = _factorial(n)
          return fact + ' / ' + s + '^' + (n + 1)
        }
      }
    }

    // Division by constant: L{f/c} = L{f}/c
    if (node.op === '/' && node.isBinary()) {
      const num = node.args[0]
      const den = node.args[1]
      if (!_containsVar(den, t)) {
        return '(' + _transform(num, t, s) + ') / ' + den.toString()
      }
    }

    throw new Error('laplace: unsupported operator "' + node.op + '" in expression "' + node.toString() + '"')
  }

  function _transformFunction (node, t, s) {
    const arg = node.args[0]

    switch (node.name) {
      case 'exp': {
        // L{e^(a*t)} = 1/(s-a), L{e^t} = 1/(s-1)
        const a = _extractLinearCoeff(arg, t)
        if (a !== null) {
          if (Math.abs(a) < 1e-12) return '1 / ' + s
          const sign = a > 0 ? ' - ' : ' + '
          return '1 / (' + s + sign + Math.abs(a) + ')'
        }
        break
      }
      case 'sin': {
        // L{sin(b*t)} = b/(s^2+b^2)
        const b = _extractLinearCoeff(arg, t)
        if (b !== null && Math.abs(b) > 1e-12) {
          const bStr = _formatNum(Math.abs(b))
          const b2 = Math.round(b * b * 1e8) / 1e8
          return bStr + ' / (' + s + '^2 + ' + _formatNum(b2) + ')'
        }
        break
      }
      case 'cos': {
        // L{cos(b*t)} = s/(s^2+b^2)
        const b = _extractLinearCoeff(arg, t)
        if (b !== null && Math.abs(b) > 1e-12) {
          const b2 = Math.round(b * b * 1e8) / 1e8
          return s + ' / (' + s + '^2 + ' + _formatNum(b2) + ')'
        }
        break
      }
      case 'sinh': {
        // L{sinh(b*t)} = b/(s^2-b^2)
        const b = _extractLinearCoeff(arg, t)
        if (b !== null && Math.abs(b) > 1e-12) {
          const bStr = _formatNum(Math.abs(b))
          const b2 = Math.round(b * b * 1e8) / 1e8
          return bStr + ' / (' + s + '^2 - ' + _formatNum(b2) + ')'
        }
        break
      }
      case 'cosh': {
        // L{cosh(b*t)} = s/(s^2-b^2)
        const b = _extractLinearCoeff(arg, t)
        if (b !== null && Math.abs(b) > 1e-12) {
          const b2 = Math.round(b * b * 1e8) / 1e8
          return s + ' / (' + s + '^2 - ' + _formatNum(b2) + ')'
        }
        break
      }
      default:
        break
    }

    // If no variable t, treat as constant
    if (!_containsVar(node, t)) {
      return node.toString() + ' / ' + s
    }

    throw new Error('laplace: unsupported function "' + node.name + '" with argument "' + arg.toString() + '"')
  }

  /**
   * Extract coefficient a such that arg = a*t.
   * Returns null if arg is not of that form.
   */
  function _extractLinearCoeff (node, t) {
    if (node.isSymbolNode && node.name === t) return 1
    if (node.isConstantNode) return 0
    if (node.isOperatorNode && node.op === '*' && node.isBinary()) {
      const l = node.args[0]
      const r = node.args[1]
      if (l.isConstantNode && r.isSymbolNode && r.name === t) return Number(l.value)
      if (r.isConstantNode && l.isSymbolNode && l.name === t) return Number(r.value)
    }
    if (node.isOperatorNode && node.op === '-' && node.isUnary()) {
      const inner = _extractLinearCoeff(node.args[0], t)
      if (inner !== null) return -inner
    }
    return null
  }

  /**
   * Compute -d/ds F(s) as a string transformation for L{t*f(t)} = -F'(s).
   * This is a simplified symbolic differentiation of common transforms.
   */
  function _multiplyByT (Fs, s) {
    // For simple cases, return -d/ds(Fs) symbolically
    // General: wrap as negated derivative
    return '-(d/d' + s + '(' + Fs + '))'
  }

  function _differentiateTransformN (Fs, s, n) {
    if (n === 0) return Fs
    const sign = n % 2 === 0 ? '' : '-'
    return sign + '(d^' + n + '/d' + s + '^' + n + '(' + Fs + '))'
  }

  function _factorial (n) {
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  function _containsVar (node, varName) {
    if (node.isSymbolNode) return node.name === varName
    if (node.isConstantNode) return false
    if (node.isFunctionNode) return node.args.some(function (a) { return _containsVar(a, varName) })
    if (node.isOperatorNode) return node.args.some(function (a) { return _containsVar(a, varName) })
    if (node.isParenthesisNode) return _containsVar(node.content, varName)
    return false
  }

  function _formatNum (n) {
    const r = Math.round(n)
    if (Math.abs(r - n) < 1e-9) return String(r)
    return String(n)
  }

  return typed(name, {
    'string, string, string': function (expr, tVar, sVar) { return computeLaplace(expr, tVar, sVar) },
    'Node, string, string': function (expr, tVar, sVar) { return computeLaplace(expr.toString(), tVar, sVar) }
  })
})
