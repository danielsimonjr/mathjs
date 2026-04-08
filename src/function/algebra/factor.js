import { factory } from '../../utils/factory.js'

const name = 'factor'
const dependencies = [
  'typed',
  'parse',
  'simplify',
  'evaluate'
]

export const createFactor = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  evaluate
}) => {
  /**
   * Factor a polynomial expression into its irreducible factors.
   * Uses the rational roots theorem: tests +/- factors of the constant term
   * divided by factors of the leading coefficient.
   *
   * Syntax:
   *
   *     math.factor(expr)
   *     math.factor(expr, variable)
   *
   * Examples:
   *
   *     math.factor('x^2 - 4')
   *     math.factor('x^2 + 2*x + 1')
   *     math.factor('x^3 - x')
   *
   * See also:
   *
   *     simplify, solve
   *
   * @param {string | Node} expr   The polynomial to factor
   * @param {string} [variable]    The variable (auto-detected if omitted)
   * @return {string}              The factored expression
   */
  function factorExpr (expr, variable) {
    const exprStr = typeof expr === 'string' ? expr : expr.toString()
    const varName = variable || _detectVariable(exprStr)

    const coeffs = _extractCoeffs(exprStr, varName)
    if (coeffs === null) {
      throw new Error('factor: expression is not a recognizable polynomial in ' + varName)
    }

    const factors = _factorPolynomial(coeffs, varName)
    return _buildFactoredString(factors, varName)
  }

  function _detectVariable (exprStr) {
    const node = parse(exprStr)
    const vars = []
    node.traverse(function (n) {
      if (n.isSymbolNode && !['e', 'pi', 'i', 'Inf', 'NaN'].includes(n.name)) {
        if (!vars.includes(n.name)) vars.push(n.name)
      }
    })
    if (vars.length === 0) return 'x'
    return vars[0]
  }

  function _extractCoeffs (exprStr, varName) {
    try {
      const testPoints = [0, 1, 2, 3, 4, 5, -1]
      const values = testPoints.map(function (x) {
        const scope = {}
        scope[varName] = x
        try {
          const result = evaluate(exprStr, scope)
          return typeof result === 'number' ? result : null
        } catch (e) {
          return null
        }
      })

      if (values.some(function (v) { return v === null })) return null

      // Finite differences to find degree
      let diffs = values.slice(0, 6)
      let degree = 0
      for (let d = 0; d <= 5; d++) {
        const maxAbs = Math.max.apply(null, diffs.map(Math.abs))
        if (maxAbs < 1e-7) {
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

      if (degree > 5) return null

      const n = degree + 1
      const xs = testPoints.slice(0, n)
      const ys = values.slice(0, n)

      // Vandermonde solve
      const mat = xs.map(function (x, i) {
        const row = []
        for (let j = 0; j <= degree; j++) row.push(Math.pow(x, j))
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
          for (let c = col; c <= n; c++) mat[r][c] -= factor * mat[col][c]
        }
      }

      return mat.map(function (row, i) { return Math.round(row[n] / row[i] * 1e8) / 1e8 })
    } catch (e) {
      return null
    }
  }

  function _factorPolynomial (coeffs, varName) {
    let cs = coeffs.slice()
    // Remove trailing near-zero coefficients
    while (cs.length > 1 && Math.abs(cs[cs.length - 1]) < 1e-9) {
      cs = cs.slice(0, -1)
    }

    const degree = cs.length - 1
    const factors = []

    // Extract leading coefficient
    const leading = cs[degree]
    if (Math.abs(leading - 1) > 1e-9) {
      factors.push({ type: 'scalar', value: leading })
      cs = cs.map(function (c) { return c / leading })
    }

    if (degree === 0) return factors
    if (degree === 1) {
      // a*x + b => (x + b/a) since leading is normalized
      factors.push({ type: 'linear', root: -cs[0] })
      return factors
    }

    // Find rational roots
    const roots = _findRoots(cs, varName)

    if (roots.length === 0) {
      // irreducible
      factors.push({ type: 'poly', coeffs: cs })
      return factors
    }

    let remaining = cs.slice()
    for (const root of roots) {
      factors.push({ type: 'linear', root })
      remaining = _syntheticDivide(remaining, root)
    }

    // Factor remaining polynomial
    if (remaining.length > 1) {
      const subFactors = _factorPolynomial(remaining, varName)
      subFactors.forEach(function (f) { factors.push(f) })
    }

    return factors
  }

  function _findRoots (coeffs, varName) {
    const n = coeffs.length - 1
    const constantTerm = Math.round(Math.abs(coeffs[0]) * 1e6) / 1e6
    const leadingCoeff = Math.round(Math.abs(coeffs[n]) * 1e6) / 1e6

    if (Math.abs(constantTerm) < 1e-9) {
      const deflated = coeffs.slice(1)
      const rest = _findRoots(deflated, varName)
      return [0].concat(rest)
    }

    const factors1 = _factors(Math.round(constantTerm))
    const factors2 = _factors(Math.round(leadingCoeff))

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
      if (remaining.length < 2) break
      if (Math.abs(_polyEval(remaining, r)) < 1e-6) {
        roots.push(Math.round(r * 1e8) / 1e8)
        remaining = _syntheticDivide(remaining, r)
      }
    }

    return roots
  }

  function _buildFactoredString (factors, varName) {
    if (factors.length === 0) return '1'

    const parts = []
    const multiplicity = new Map()

    // Count multiplicities of linear factors
    const linears = []
    let scalar = 1
    const polys = []

    for (const f of factors) {
      if (f.type === 'scalar') {
        scalar *= f.value
      } else if (f.type === 'linear') {
        linears.push(f.root)
      } else if (f.type === 'poly') {
        polys.push(f.coeffs)
      }
    }

    if (Math.abs(scalar - 1) > 1e-9) {
      parts.push(_formatNumber(scalar))
    }

    // Group by root for multiplicity
    const rootMap = new Map()
    for (const r of linears) {
      const key = String(Math.round(r * 1e8) / 1e8)
      rootMap.set(key, (rootMap.get(key) || 0) + 1)
    }

    rootMap.forEach(function (count, key) {
      const root = Number(key)
      let term
      if (Math.abs(root) < 1e-10) {
        term = varName
      } else {
        const sign = root > 0 ? ' - ' : ' + '
        term = '(' + varName + sign + _formatNumber(Math.abs(root)) + ')'
      }
      if (count > 1) {
        term = term + '^' + count
      }
      parts.push(term)
    })

    for (const polyCoeffs of polys) {
      parts.push('(' + _buildPolyString(polyCoeffs, varName) + ')')
    }

    return parts.join(' * ')
  }

  function _buildPolyString (coeffs, varName) {
    const terms = []
    for (let i = coeffs.length - 1; i >= 0; i--) {
      const c = coeffs[i]
      if (Math.abs(c) < 1e-10) continue
      let term
      if (i === 0) {
        term = _formatNumber(c)
      } else if (i === 1) {
        if (Math.abs(c - 1) < 1e-9) term = varName
        else if (Math.abs(c + 1) < 1e-9) term = '-' + varName
        else term = _formatNumber(c) + ' * ' + varName
      } else {
        if (Math.abs(c - 1) < 1e-9) term = varName + '^' + i
        else if (Math.abs(c + 1) < 1e-9) term = '-' + varName + '^' + i
        else term = _formatNumber(c) + ' * ' + varName + '^' + i
      }
      terms.push(term)
    }
    if (terms.length === 0) return '0'
    return terms.join(' + ').replace(/\+ -/g, '- ')
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

  function _formatNumber (n) {
    const r = Math.round(n)
    if (Math.abs(r - n) < 1e-9) return String(r)
    return String(n)
  }

  return typed(name, {
    'string': function (expr) { return factorExpr(expr, null) },
    'Node': function (expr) { return factorExpr(expr.toString(), null) },
    'string, string': function (expr, variable) { return factorExpr(expr, variable) },
    'Node, string': function (expr, variable) { return factorExpr(expr.toString(), variable) }
  })
})
