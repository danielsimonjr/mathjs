import { factory } from '../../utils/factory.js'

const name = 'solve'
const dependencies = [
  'typed',
  'parse',
  'simplify'
]

export const createSolve = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Solve an equation or expression equal to zero for a given variable.
   * Handles linear equations, quadratic equations (via quadratic formula),
   * and simple polynomials (rational roots theorem).
   * Input can be 'x^2 - 4 = 0' or 'x^2 - 4' (treated as = 0).
   *
   * Syntax:
   *
   *     math.solve(expr, variable)
   *
   * Examples:
   *
   *     math.solve('x^2 - 4', 'x')
   *     math.solve('2*x + 6', 'x')
   *     math.solve('x^2 - 5*x + 6', 'x')
   *
   * See also:
   *
   *     simplify, parse
   *
   * @param {string} expr        The equation or expression (= 0)
   * @param {string} variable    The variable to solve for
   * @return {number[]}          Array of solutions
   */
  function solveExpr (expr, variable) {
    let exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = typeof variable === 'string' ? variable : variable.name

    // Handle 'lhs = rhs' by converting to lhs - rhs
    if (exprStr.includes('=')) {
      const parts = exprStr.split('=')
      if (parts.length !== 2) throw new Error('solve: invalid equation format')
      exprStr = '(' + parts[0].trim() + ') - (' + parts[1].trim() + ')'
    }

    const coeffs = _extractPolynomialCoeffs(exprStr, varName)

    if (coeffs !== null) {
      return _solvePolynomial(coeffs)
    }

    return _numericalSolve(exprStr, varName)
  }

  function _extractPolynomialCoeffs (exprStr, varName) {
    try {
      const testPoints = [0, 1, 2, 3, 4, 5]
      const values = testPoints.map(function (x) {
        const scope = {}
        scope[varName] = x
        try {
          return _evalExpr(exprStr, scope)
        } catch (e) {
          return null
        }
      })

      if (values.some(function (v) { return v === null })) return null

      let diffs = values.slice()
      let degree = 0
      for (let d = 0; d <= 5; d++) {
        const maxAbs = Math.max.apply(null, diffs.map(Math.abs))
        if (maxAbs < 1e-9) {
          degree = d
          break
        }
        const nextDiffs = []
        for (let i = 0; i < diffs.length - 1; i++) {
          nextDiffs.push(diffs[i + 1] - diffs[i])
        }
        diffs = nextDiffs
        if (d === 5) degree = 5
      }

      if (degree > 4) return null

      const n = degree + 1
      const xs = testPoints.slice(0, n)
      const ys = values.slice(0, n)

      const mat = xs.map(function (x, i) {
        const row = []
        for (let j = 0; j <= degree; j++) {
          row.push(Math.pow(x, j))
        }
        row.push(ys[i])
        return row
      })

      for (let col = 0; col < n; col++) {
        let maxRow = col
        for (let r = col + 1; r < n; r++) {
          if (Math.abs(mat[r][col]) > Math.abs(mat[maxRow][col])) maxRow = r
        }
        const tmp = mat[col]; mat[col] = mat[maxRow]; mat[maxRow] = tmp

        if (Math.abs(mat[col][col]) < 1e-12) return null

        for (let r = 0; r < n; r++) {
          if (r === col) continue
          const factor = mat[r][col] / mat[col][col]
          for (let c = col; c <= n; c++) {
            mat[r][c] -= factor * mat[col][c]
          }
        }
      }

      const coeffs = mat.map(function (row, i) { return row[n] / row[i] })
      return coeffs
    } catch (e) {
      return null
    }
  }

  function _evalExpr (exprStr, scope) {
    const node = parse(exprStr)
    return _evalNode(node, scope)
  }

  function _evalNode (node, scope) {
    if (node.isConstantNode) return Number(node.value)
    if (node.isSymbolNode) {
      if (Object.prototype.hasOwnProperty.call(scope, node.name)) return scope[node.name]
      return 0
    }
    if (node.isParenthesisNode) return _evalNode(node.content, scope)
    if (node.isOperatorNode) {
      const args = node.args.map(function (a) { return _evalNode(a, scope) })
      switch (node.op) {
        case '+': return args.length === 1 ? args[0] : args[0] + args[1]
        case '-': return args.length === 1 ? -args[0] : args[0] - args[1]
        case '*': return args[0] * args[1]
        case '/': return args[0] / args[1]
        case '^': return Math.pow(args[0], args[1])
        default: throw new Error('unsupported op: ' + node.op)
      }
    }
    if (node.isFunctionNode) {
      const args = node.args.map(function (a) { return _evalNode(a, scope) })
      switch (node.name) {
        case 'sqrt': return Math.sqrt(args[0])
        case 'abs': return Math.abs(args[0])
        case 'sin': return Math.sin(args[0])
        case 'cos': return Math.cos(args[0])
        case 'exp': return Math.exp(args[0])
        case 'log': return Math.log(args[0])
        default: throw new Error('unsupported function: ' + node.name)
      }
    }
    throw new Error('unsupported node: ' + node.type)
  }

  function _solvePolynomial (coeffs) {
    let cs = coeffs.slice()
    while (cs.length > 1 && Math.abs(cs[cs.length - 1]) < 1e-10) {
      cs = cs.slice(0, -1)
    }
    const degree = cs.length - 1

    if (degree === 0) {
      if (Math.abs(cs[0]) < 1e-10) return []
      throw new Error('solve: equation has no solution (constant non-zero)')
    }

    if (degree === 1) {
      return [_round(-cs[0] / cs[1])]
    }

    if (degree === 2) {
      const a = cs[2]
      const b = cs[1]
      const c = cs[0]
      const disc = b * b - 4 * a * c
      if (disc < 0) return []
      if (Math.abs(disc) < 1e-10) return [_round(-b / (2 * a))]
      const sqrtDisc = Math.sqrt(disc)
      return [_round((-b - sqrtDisc) / (2 * a)), _round((-b + sqrtDisc) / (2 * a))].sort(function (x, y) { return x - y })
    }

    return _rationalRoots(cs)
  }

  function _rationalRoots (coeffs) {
    const n = coeffs.length - 1
    const constantTerm = Math.abs(Math.round(coeffs[0]))
    const leadingCoeff = Math.abs(Math.round(coeffs[n]))

    if (constantTerm === 0) {
      const deflated = coeffs.slice(1)
      const rest = _solvePolynomial(deflated)
      return _unique([0].concat(rest).sort(function (a, b) { return a - b }))
    }

    const factors1 = _factors(constantTerm)
    const factors2 = _factors(leadingCoeff)

    const candidates = []
    factors1.forEach(function (p) {
      factors2.forEach(function (q) {
        candidates.push(p / q)
        candidates.push(-p / q)
      })
    })

    const roots = []
    let remaining = coeffs.slice()

    for (const r of candidates) {
      if (Math.abs(_polyEval(remaining, r)) < 1e-8) {
        roots.push(_round(r))
        remaining = _syntheticDivide(remaining, r)
        while (remaining.length > 1 && Math.abs(_polyEval(remaining, r)) < 1e-8) {
          roots.push(_round(r))
          remaining = _syntheticDivide(remaining, r)
        }
      }
    }

    if (remaining.length > 1 && remaining.length <= 3) {
      const moreRoots = _solvePolynomial(remaining)
      moreRoots.forEach(function (r) { roots.push(r) })
    }

    return _unique(roots.sort(function (a, b) { return a - b }))
  }

  function _polyEval (coeffs, x) {
    let result = 0
    for (let i = coeffs.length - 1; i >= 0; i--) {
      result = result * x + coeffs[i]
    }
    return result
  }

  function _syntheticDivide (coeffs, root) {
    const n = coeffs.length
    const result = new Array(n - 1).fill(0)
    result[n - 2] = coeffs[n - 1]
    for (let i = n - 3; i >= 0; i--) {
      result[i] = coeffs[i + 1] + root * result[i + 1]
    }
    return result
  }

  function _factors (n) {
    const result = [1]
    for (let i = 2; i <= Math.abs(n); i++) {
      if (n % i === 0) result.push(i)
    }
    return result
  }

  function _unique (arr) {
    const seen = []
    return arr.filter(function (x) {
      for (const s of seen) {
        if (Math.abs(x - s) < 1e-9) return false
      }
      seen.push(x)
      return true
    })
  }

  function _round (x) {
    return Math.round(x * 1e10) / 1e10
  }

  function _numericalSolve (exprStr, varName) {
    const roots = []
    const N = 200
    const range = 20
    let prev = null

    for (let i = 0; i <= N; i++) {
      const x = -range + (2 * range * i) / N
      const scope = {}
      scope[varName] = x
      let val
      try {
        val = _evalExpr(exprStr, scope)
      } catch (e) {
        prev = null
        continue
      }

      if (Math.abs(val) < 1e-10) {
        roots.push(_round(x))
        prev = null
        continue
      }

      if (prev !== null && prev.sign !== Math.sign(val)) {
        let lo = prev.x
        let hi = x
        for (let j = 0; j < 60; j++) {
          const mid = (lo + hi) / 2
          const scopeMid = {}
          scopeMid[varName] = mid
          let vmid
          try {
            vmid = _evalExpr(exprStr, scopeMid)
          } catch (e) {
            break
          }
          if (Math.abs(vmid) < 1e-12) { roots.push(_round(mid)); break }
          if (Math.sign(vmid) === Math.sign(prev.val)) lo = mid
          else hi = mid
        }
        const midFinal = (lo + hi) / 2
        const scopeFinal = {}
        scopeFinal[varName] = midFinal
        let vmidFinal
        try {
          vmidFinal = _evalExpr(exprStr, scopeFinal)
        } catch (e) {
          vmidFinal = 1
        }
        if (Math.abs(vmidFinal) < 1e-8) roots.push(_round(midFinal))
      }

      prev = { x, val, sign: Math.sign(val) }
    }

    return _unique(roots.sort(function (a, b) { return a - b }))
  }

  return typed(name, {
    'string, string': function (expr, variable) { return solveExpr(expr, variable) },
    'Node, string': function (expr, variable) { return solveExpr(expr.toString(), variable) }
  })
})
