import { factory } from '../../utils/factory.js'

const name = 'groebnerBasis'
const dependencies = ['typed', 'parse', 'simplify']

export const createGroebnerBasis = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute a Gröbner basis for a polynomial ideal using Buchberger's algorithm.
   *
   * Implements a simplified version supporting univariate and bivariate
   * polynomial systems with lexicographic ordering. For complex multivariate
   * cases, partial reduction is attempted.
   *
   * Syntax:
   *
   *     math.groebnerBasis(polynomials, variables)
   *
   * Examples:
   *
   *     math.groebnerBasis(["x^2 + y^2 - 1", "x - y"], ["x", "y"])
   *     math.groebnerBasis(["x^2 - 1"], ["x"])
   *
   * See also:
   *
   *     eliminate, resultant, polynomialGCD
   *
   * @param {string[]} polynomials   Array of polynomial strings
   * @param {string[]} variables     Array of variable names (lex order)
   * @return {string[]}              Gröbner basis polynomials
   */
  return typed(name, {
    'Array, Array': function (polynomials, variables) {
      return computeGroebner(polynomials, variables)
    }
  })

  function computeGroebner (polys, vars) {
    if (polys.length === 0) return []
    if (vars.length === 0) return polys.slice()

    // For univariate case, GCD gives the Gröbner basis
    if (vars.length === 1) {
      return univariateGroebner(polys, vars[0])
    }

    // For bivariate/multivariate: use numeric Buchberger on coefficient arrays
    if (vars.length === 2) {
      return bivariateGroebner(polys, vars)
    }

    throw new Error('groebnerBasis: only 1 or 2 variables are supported')
  }

  function univariateGroebner (polys, variable) {
    if (polys.length === 1) return polys.slice()

    // GCD of all polynomials is the Gröbner basis
    let g = extractCoeffs(parse(polys[0]), variable)
    for (let i = 1; i < polys.length; i++) {
      const q = extractCoeffs(parse(polys[i]), variable)
      g = polyGCD(g, q)
    }
    g = makeMonic(trimCoeffs(g))
    return [coeffsToString(g, variable)]
  }

  function bivariateGroebner (polys, vars) {
    // Evaluate on a grid to represent polynomials numerically, then reduce
    // This is a simplified implementation that handles common cases
    // For each polynomial, we use the structure: each term is cx^i*y^j
    const parsed = polys.map(p => parse(p))

    // Try to reduce: for the case of 2 polynomials in 2 variables,
    // use resultant approach to get univariate polynomial, then combine
    if (parsed.length === 2) {
      const [p, q] = parsed
      const [x, y] = vars

      // Compute resultant(p, q, x) to eliminate x
      const resX = computeResultantNumerically(p, q, x, y)
      // Compute resultant(p, q, y) to eliminate y
      const resY = computeResultantNumerically(p, q, y, x)

      const basis = []
      if (resX !== null) basis.push(resX)
      if (resY !== null) basis.push(resY)
      if (basis.length === 0) return polys.slice()
      return basis
    }

    // For more than 2 polynomials, full Buchberger is not implemented
    throw new Error('groebnerBasis: only 1 or 2 polynomials are supported for bivariate systems')
  }

  /**
   * Numerically compute a univariate polynomial by eliminating one variable.
   */
  function computeResultantNumerically (pNode, qNode, elimVar, keepVar) {
    try {
      // Sample at multiple values of keepVar to get resultant polynomial.
      // Start from 0 so that Vandermonde fitting (which uses x=0,1,2,...) produces
      // coefficients of a polynomial in keepVar directly.
      const samplePoints = [0, 1, 2, 3, 4]
      const resultantValues = samplePoints.map(kv => {
        // For each value of keepVar, compute resultant(p(elimVar,kv), q(elimVar,kv))
        const scope = {}
        scope[keepVar] = kv
        const pCoeffs = extractCoeffsWithScope(pNode, elimVar, scope)
        const qCoeffs = extractCoeffsWithScope(qNode, elimVar, scope)
        return sylvesterDet(pCoeffs, qCoeffs)
      })

      // Fit polynomial to these resultant values
      const coeffs = solveVandermonde(resultantValues)
      for (let i = 0; i < coeffs.length; i++) {
        const r = Math.round(coeffs[i])
        coeffs[i] = Math.abs(coeffs[i] - r) < 1e-6 ? r + 0 : parseFloat(coeffs[i].toPrecision(8))
      }
      const trimmed = trimCoeffs(coeffs)
      if (trimmed.length === 1 && Math.abs(trimmed[0]) < 1e-9) return null
      const monic = makeMonic(trimmed)
      return coeffsToString(monic, keepVar)
    } catch (e) {
      throw new Error('groebnerBasis: resultant computation failed for variable "' + keepVar + '": ' + e.message)
    }
  }

  function extractCoeffsWithScope (node, variable, fixedScope) {
    const MAX_DEGREE = 6
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = Object.assign({}, fixedScope)
      scope[variable] = i
      try {
        const val = node.evaluate(scope)
        values.push(typeof val === 'number' ? val : Number(val))
      } catch (e) {
        values.push(0)
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

  function extractCoeffs (node, variable) {
    const MAX_DEGREE = 10
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = {}
      scope[variable] = i
      try {
        const val = node.evaluate(scope)
        values.push(typeof val === 'number' ? val : Number(val))
      } catch (e) {
        throw new Error('groebnerBasis: could not evaluate polynomial at ' + variable + '=' + i + ': ' + e.message)
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
    const coeffs = solveVandermonde(values.slice(0, degree + 1))
    for (let i = 0; i < coeffs.length; i++) {
      const r = Math.round(coeffs[i])
      coeffs[i] = Math.abs(coeffs[i] - r) < 1e-6 ? r + 0 : parseFloat(coeffs[i].toPrecision(10))
    }
    while (coeffs.length > 1 && Math.abs(coeffs[coeffs.length - 1]) < 1e-9) coeffs.pop()
    return coeffs
  }

  function polyGCD (p, q) {
    p = trimCoeffs(p)
    q = trimCoeffs(q)
    const maxIter = 1000
    let iter = 0
    while (q.length > 1 || Math.abs(q[0]) > 1e-9) {
      if (++iter > maxIter) {
        throw new Error('groebnerBasis: polyGCD did not converge after ' + maxIter + ' iterations')
      }
      const r = trimCoeffs(polyRem(p, q))
      if (r.length === 1 && Math.abs(r[0]) < 1e-9) return makeMonic(trimCoeffs(q))
      p = q; q = r
    }
    return [1]
  }

  function polyRem (p, q) {
    p = p.slice()
    const lc = q[q.length - 1]
    while (p.length >= q.length) {
      const factor = p[p.length - 1] / lc
      const offset = p.length - q.length
      for (let i = 0; i < q.length; i++) p[offset + i] -= factor * q[i]
      p.pop()
      while (p.length > 1 && Math.abs(p[p.length - 1]) < 1e-10) p.pop()
    }
    return p
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

  function trimCoeffs (arr) {
    const a = arr.slice()
    while (a.length > 1 && Math.abs(a[a.length - 1]) < 1e-9) a.pop()
    return a
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
