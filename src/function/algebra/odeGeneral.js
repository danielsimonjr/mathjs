import { factory } from '../../utils/factory.js'

const name = 'odeGeneral'
const dependencies = [
  'typed',
  'parse',
  'simplify',
  'integrate',
  'derivative'
]

export const createOdeGeneral = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  integrate,
  derivative
}) => {
  /**
   * Solve first-order ordinary differential equations (ODEs) symbolically.
   *
   * Handles two forms:
   *   1. Separable ODEs: dy/dx = g(x) * h(y)
   *      - Separates and integrates both sides
   *      - Example: dy/dx = y → dy/y = dx → ln|y| = x + C → y = C*exp(x)
   *   2. Linear first-order ODEs: dy/dx + P(x)*y = Q(x)
   *      - Uses integrating factor mu(x) = exp(integral of P(x) dx)
   *
   * The expression `expr` represents the right-hand side of dy/dx = expr,
   * where `y` is the dependent variable and `x` is the independent variable.
   *
   * Syntax:
   *
   *     math.odeGeneral(expr, y, x)
   *
   * Examples:
   *
   *     math.odeGeneral('y', 'y', 'x')
   *     math.odeGeneral('-y', 'y', 'x')
   *     math.odeGeneral('x', 'y', 'x')
   *
   * See also:
   *
   *     integrate, derivative, simplify
   *
   * @param {string | Node} expr  Right-hand side of dy/dx = expr
   * @param {string} y            The dependent variable name
   * @param {string} x            The independent variable name
   * @return {string}             General solution as a string (with constant C)
   */
  return typed(name, {
    'string, string, string': (expr, y, x) => _solveOde(expr, y, x),
    'Node, string, string': (expr, y, x) => _solveOde(expr.toString(), y, x)
  })

  function _solveOde (exprStr, y, x) {
    const normalized = exprStr.replace(/\s+/g, '')

    // Try separable ODE: dy/dx = g(x) * h(y)
    const separable = _trySeparable(normalized, y, x)
    if (separable !== null) return separable

    // Try linear first-order: dy/dx + P(x)*y = Q(x)
    // i.e. dy/dx = Q(x) - P(x)*y
    const linear = _tryLinear(normalized, y, x)
    if (linear !== null) return linear

    throw new Error(
      'odeGeneral: cannot solve dy/dx = "' + exprStr +
      '". Only separable and linear first-order ODEs are supported.'
    )
  }

  /**
   * Attempt to solve as separable ODE: dy/dx = g(x) * h(y)
   * Decomposes expr into a part depending only on x and a part only on y.
   */
  function _trySeparable (normalized, y, x) {
    // Case 1: expr has no y dependence → dy/dx = g(x) → y = integral(g(x)) + C
    if (!normalized.includes(y)) {
      try {
        const integralX = integrate(normalized, x)
        return y + ' = ' + integralX + ' + C'
      } catch (e) {
        return null
      }
    }

    // Case 2: expr has no x dependence → dy/dx = h(y)
    // dy/h(y) = dx → integral(1/h(y) dy) = x + C
    if (!normalized.includes(x)) {
      // h(y) is the expression
      const hy = normalized
      try {
        // integral of 1/h(y) with respect to y
        const reciprocal = '1 / (' + hy + ')'
        const integralY = integrate(reciprocal, y)
        return integralY + ' = x + C'
      } catch (e) {
        return null
      }
    }

    // Case 3: expr = g(x) * h(y) — try to factor
    // Simple pattern: expr = coefficient*y^n*g(x) or g(x)*y^n
    const factored = _factorSeparable(normalized, y, x)
    if (factored !== null) {
      const { gx, hy } = factored
      try {
        const lhs = integrate('1 / (' + hy + ')', y)
        const rhs = integrate(gx, x)
        return lhs + ' = ' + rhs + ' + C'
      } catch (e) {
        return null
      }
    }

    return null
  }

  /**
   * Try to factor expr = gx * hy where gx depends only on x and hy only on y.
   * Handles simple cases: c*y, c*y^n, f(x)*y, f(x)*y^n
   */
  function _factorSeparable (normalized, y, x) {
    // Pattern: something * y (e.g. x*y, 2*x*y, x^2*y)
    // We'll try splitting at * around the y term
    const patterns = [
      // expr = A * y → gx = A, hy = y
      { re: /^(.+)\*([a-zA-Z_]\w*)$/, yIdx: 2, gxIdx: 1 },
      { re: /^([a-zA-Z_]\w*)\*(.+)$/, yIdx: 1, gxIdx: 2 }
    ]

    for (const { re, yIdx, gxIdx } of patterns) {
      const m = normalized.match(re)
      if (m) {
        const yPart = m[yIdx]
        const xPart = m[gxIdx]
        if (yPart === y && !xPart.includes(y)) {
          return { gx: xPart, hy: y }
        }
        if (xPart === y && !yPart.includes(y)) {
          return { gx: yPart, hy: y }
        }
      }
    }

    return null
  }

  /**
   * Try to solve as linear first-order ODE: dy/dx = -P(x)*y + Q(x)
   * Only handles simple case where coefficient of y is a constant.
   */
  function _tryLinear (normalized, y, x) {
    // Check if expr = Q(x) - P*y where P is a constant
    // Pattern: Q(x) - P*y or -P*y + Q(x)
    // For now handle: c*y + f(x) forms
    // Detect by checking derivative with respect to y is a constant (no x or y in it)
    try {
      const dExpr_dy_node = derivative(normalized, y)
      const dExpr_dy = dExpr_dy_node.toString().replace(/\s+/g, '')

      // If derivative w.r.t. y is constant (no y, no x) → linear with P = -dExpr/dy
      if (!dExpr_dy.includes(y) && !dExpr_dy.includes(x)) {
        const negP = dExpr_dy  // derivative of expr w.r.t. y = -P (so P = -negP)
        let P
        try {
          P = -Number(negP)
        } catch (e) {
          return null
        }
        if (!isFinite(P)) return null

        // Q(x) = expr evaluated at y=0
        // expr = -P*y + Q(x), so Q(x) = expr|_{y=0}
        const exprNode = parse(normalized)
        let Qexpr
        try {
          // Substitute y=0 symbolically by replacing SymbolNode y with 0
          Qexpr = _substituteZero(exprNode, y)
        } catch (e) {
          return null
        }

        // Integrating factor: mu = exp(P*x)
        // Solution: y = exp(-P*x) * [integral(Q(x)*exp(P*x) dx) + C]
        const Pstr = String(P)
        const muArg = Pstr + ' * ' + x
        const integrand = '(' + Qexpr + ') * exp(' + muArg + ')'
        try {
          const integralQmu = integrate(integrand, x)
          if (P === 0) {
            return y + ' = ' + integralQmu + ' + C'
          }
          const PnegStr = String(-P)
          return y + ' = exp(' + PnegStr + ' * ' + x + ') * (' + integralQmu + ' + C)'
        } catch (e) {
          return null
        }
      }
    } catch (e) {
      return null
    }

    return null
  }

  /**
   * Substitute all occurrences of variable `varName` in node with 0.
   * Returns string representation.
   */
  function _substituteZero (node, varName) {
    const str = node.toString()
    // Simple approach: replace standalone variable with 0 using regex
    const re = new RegExp('\\b' + varName + '\\b', 'g')
    const replaced = str.replace(re, '0')
    // Simplify to get the Q(x) expression
    try {
      return simplify(replaced).toString()
    } catch (e) {
      return replaced
    }
  }
})
