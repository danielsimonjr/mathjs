import { factory } from '../../utils/factory.js'

const name = 'eliminate'
const dependencies = ['typed', 'parse', 'resultant']

export const createEliminate = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  resultant
}) => {
  /**
   * Eliminate specified variables from a system of polynomial equations.
   *
   * For a two-equation system, uses the resultant to eliminate one variable
   * at a time. Returns equations in the remaining variables.
   *
   * Equations may be given as:
   * - Expression strings (treated as = 0)
   * - Equation strings 'lhs = rhs' (converted to lhs - rhs = 0)
   *
   * Syntax:
   *
   *     math.eliminate(equations, variablesToEliminate)
   *
   * Examples:
   *
   *     math.eliminate(["x + y - 1", "x - y"], ["x"])
   *     math.eliminate(["x^2 + y^2 - 1", "x - y"], ["x"])
   *
   * See also:
   *
   *     resultant, groebnerBasis, solve
   *
   * @param {string[]} equations             Array of polynomial equations/expressions
   * @param {string[]} variablesToEliminate  Variables to eliminate
   * @return {string[]}                      Remaining equations
   */
  return typed(name, {
    'Array, Array': function (equations, vars) {
      return eliminateVars(equations, vars)
    }
  })

  function eliminateVars (equations, varsToElim) {
    let remaining = equations.map(normalizeEq)

    for (const elimVar of varsToElim) {
      remaining = eliminateOne(remaining, elimVar)
    }

    return remaining
  }

  /**
   * Normalize equation: convert 'lhs = rhs' to 'lhs - (rhs)'.
   */
  function normalizeEq (eq) {
    if (eq.includes('=')) {
      const parts = eq.split('=')
      if (parts.length !== 2) throw new Error('eliminate: invalid equation: ' + eq)
      return '(' + parts[0].trim() + ') - (' + parts[1].trim() + ')'
    }
    return eq
  }

  /**
   * Eliminate one variable from a system using resultants.
   * @param {string[]} eqs
   * @param {string} elimVar
   * @return {string[]}
   */
  function eliminateOne (eqs, elimVar) {
    if (eqs.length < 2) {
      throw new Error('eliminate: need at least 2 equations to eliminate a variable')
    }

    const result = []

    // For each pair (eqs[0], eqs[i]), compute resultant as a polynomial
    for (let i = 1; i < eqs.length; i++) {
      const polyRes = resultantAsPolynomial(eqs[0], eqs[i], elimVar)
      if (polyRes !== null && polyRes !== '0') {
        result.push(polyRes)
      }
    }

    return result.length > 0 ? result : eqs.slice(1)
  }

  /**
   * Compute resultant as a polynomial string in the remaining variable.
   * Uses numeric sampling to reconstruct the resultant polynomial.
   */
  function resultantAsPolynomial (p, q, elimVar) {
    const pNode = parse(p)
    const qNode = parse(q)

    // Detect remaining variable by sampling
    const remainingVars = detectRemainingVars(pNode, qNode, elimVar)

    if (remainingVars.length === 0) {
      // Both polynomials are univariate in elimVar
      const val = resultant(p, q, elimVar)
      return String(Math.round(val * 1e9) / 1e9)
    }

    const keepVar = remainingVars[0]

    // Sample resultant at multiple values of keepVar
    const samplePoints = [0, 1, 2, 3, 4, 5, 6]
    const vals = samplePoints.map(kv => {
      const scope = {}
      scope[keepVar] = kv
      const pCoeffs = extractCoeffsFixed(pNode, elimVar, scope)
      const qCoeffs = extractCoeffsFixed(qNode, elimVar, scope)
      return sylvesterDet(pCoeffs, qCoeffs)
    })

    // Find degree and fit polynomial
    const diffs = [vals.slice()]
    let degree = 0
    for (let order = 1; order <= 6; order++) {
      const prev = diffs[order - 1]
      const cur = []
      for (let j = 0; j < prev.length - 1; j++) cur.push(prev[j + 1] - prev[j])
      diffs.push(cur)
      const maxAbs = cur.length > 0 ? Math.max(...cur.map(Math.abs)) : 0
      if (maxAbs < 1e-6) { degree = order - 1; break }
      if (order === 6) degree = 6
    }

    const coeffs = solveVandermonde(vals.slice(0, degree + 1))
    for (let i = 0; i < coeffs.length; i++) {
      const r = Math.round(coeffs[i])
      coeffs[i] = Math.abs(coeffs[i] - r) < 1e-6 ? r + 0 : parseFloat(coeffs[i].toPrecision(8))
    }
    const trimmed = trimCoeffs(coeffs)
    if (trimmed.length === 1 && Math.abs(trimmed[0]) < 1e-9) return '0'
    const monic = makeMonic(trimmed)
    return coeffsToString(monic, keepVar)
  }

  function detectRemainingVars (pNode, qNode, elimVar) {
    const KNOWN = new Set(['pi', 'e', 'i', 'true', 'false', 'Infinity', 'NaN'])
    const vars = new Set()
    collectSymbols(pNode, vars)
    collectSymbols(qNode, vars)
    vars.delete(elimVar)
    for (const k of KNOWN) vars.delete(k)
    return Array.from(vars).sort()
  }

  function collectSymbols (node, set) {
    if (node.isSymbolNode) { set.add(node.name); return }
    if (node.isConstantNode) return
    const children = node.args || (node.content ? [node.content] : [])
    for (const child of children) collectSymbols(child, set)
  }

  function extractCoeffsFixed (node, variable, fixedScope) {
    const MAX_DEGREE = 6
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = Object.assign({}, fixedScope)
      scope[variable] = i
      try {
        const val = node.evaluate(scope)
        values.push(typeof val === 'number' ? val : Number(val))
      } catch (e) {
        throw new Error('eliminate: could not evaluate polynomial at ' + variable + '=' + i + ': ' + e.message)
      }
    }
    const diffs = [values.slice()]
    let degree = 0
    for (let order = 1; order <= MAX_DEGREE + 1; order++) {
      const prev = diffs[order - 1]
      const cur = []
      for (let j = 0; j < prev.length - 1; j++) cur.push(prev[j + 1] - prev[j])
      diffs.push(cur)
      const maxAbs = cur.length > 0 ? Math.max(...cur.map(Math.abs)) : 0
      if (maxAbs < 1e-6) { degree = order - 1; break }
      if (order === MAX_DEGREE + 1) degree = MAX_DEGREE
    }
    return solveVandermonde(values.slice(0, degree + 1))
  }

  function sylvesterDet (p, q) {
    const m = p.length - 1
    const n = q.length - 1
    const size = m + n
    if (size === 0) return 1
    if (m === 0) return Math.pow(p[0], n)
    if (n === 0) return Math.pow(q[0], m)

    const pDesc = p.slice().reverse()
    const qDesc = q.slice().reverse()
    const mat = []
    for (let i = 0; i < size; i++) mat.push(new Array(size).fill(0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= m; j++) {
        if (i + j < size) mat[i][i + j] = pDesc[j]
      }
    }
    for (let i = 0; i < m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i + j < size) mat[n + i][i + j] = qDesc[j]
      }
    }
    return detMatrix(mat)
  }

  function detMatrix (mat) {
    const n = mat.length
    const A = mat.map(row => row.slice())
    let d = 1
    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
      }
      if (maxRow !== col) { const tmp = A[col]; A[col] = A[maxRow]; A[maxRow] = tmp; d *= -1 }
      if (Math.abs(A[col][col]) < 1e-14) return 0
      d *= A[col][col]
      for (let row = col + 1; row < n; row++) {
        const factor = A[row][col] / A[col][col]
        for (let k = col; k < n; k++) A[row][k] -= factor * A[col][k]
      }
    }
    return d
  }

  function solveVandermonde (vals) {
    const n = vals.length
    const A = []
    const b = vals.slice()
    for (let i = 0; i < n; i++) {
      const row = []
      for (let j = 0; j < n; j++) row.push(Math.pow(i, j))
      A.push(row)
    }
    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
      }
      const tmpA = A[col]; A[col] = A[maxRow]; A[maxRow] = tmpA
      const tmpB = b[col]; b[col] = b[maxRow]; b[maxRow] = tmpB
      for (let row = 0; row < n; row++) {
        if (row === col || A[col][col] === 0) continue
        const factor = A[row][col] / A[col][col]
        for (let k = col; k < n; k++) A[row][k] -= factor * A[col][k]
        b[row] -= factor * b[col]
      }
    }
    return b.map((val, i) => A[i][i] !== 0 ? val / A[i][i] : 0)
  }

  function trimCoeffs (arr) {
    const a = arr.slice()
    while (a.length > 1 && Math.abs(a[a.length - 1]) < 1e-9) a.pop()
    return a
  }

  function makeMonic (p) {
    const lc = p[p.length - 1]
    if (Math.abs(lc) < 1e-12) return p
    return p.map(c => {
      const v = c / lc
      const r = Math.round(v)
      return Math.abs(v - r) < 1e-9 ? r + 0 : parseFloat(v.toPrecision(10))
    })
  }

  function coeffsToString (coeffs, variable) {
    const terms = []
    for (let deg = coeffs.length - 1; deg >= 0; deg--) {
      const c = coeffs[deg]
      if (Math.abs(c) < 1e-10) continue
      const cn = Math.round(c * 1e9) / 1e9
      let term
      if (deg === 0) {
        term = String(cn)
      } else if (deg === 1) {
        if (Math.abs(c - 1) < 1e-9) term = variable
        else if (Math.abs(c + 1) < 1e-9) term = `-${variable}`
        else term = `${cn} * ${variable}`
      } else {
        if (Math.abs(c - 1) < 1e-9) term = `${variable} ^ ${deg}`
        else if (Math.abs(c + 1) < 1e-9) term = `-${variable} ^ ${deg}`
        else term = `${cn} * ${variable} ^ ${deg}`
      }
      terms.push(term)
    }
    if (terms.length === 0) return '0'
    let result = terms[0]
    for (let i = 1; i < terms.length; i++) {
      if (terms[i].startsWith('-')) result += ' - ' + terms[i].slice(1)
      else result += ' + ' + terms[i]
    }
    return result
  }
})
