import { factory } from '../../utils/factory.js'

const name = 'polynomialGCD'
const dependencies = ['typed', 'parse', 'simplify']

export const createPolynomialGCD = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute the Greatest Common Divisor (GCD) of two polynomials.
   *
   * Uses the Euclidean algorithm on polynomial coefficient arrays to find
   * the GCD of two univariate polynomials. The result is normalized to be
   * monic (leading coefficient 1).
   *
   * Syntax:
   *
   *     math.polynomialGCD(p, q, variable)
   *
   * Examples:
   *
   *     math.polynomialGCD('x^2 - 1', 'x^2 - 2*x + 1', 'x')   // 'x - 1'
   *     math.polynomialGCD('x^2 - 1', 'x + 1', 'x')            // 'x + 1'
   *     math.polynomialGCD('x^3 - x', 'x^2 - 1', 'x')          // 'x ^ 2 - 1' or 'x - 1' depending on normalization
   *
   * See also:
   *
   *     polynomialQuotient, polynomialRemainder, simplify
   *
   * @param {Node|string} p      First polynomial
   * @param {Node|string} q      Second polynomial
   * @param {string} variable    The variable name
   * @return {string}            The GCD polynomial as a string (monic)
   */
  return typed(name, {
    'Node, Node, string': function (p, q, variable) {
      return computeGCD(p, q, variable)
    },
    'string, string, string': function (p, q, variable) {
      return computeGCD(parse(p), parse(q), variable)
    },
    'string, Node, string': function (p, q, variable) {
      return computeGCD(parse(p), q, variable)
    },
    'Node, string, string': function (p, q, variable) {
      return computeGCD(p, parse(q), variable)
    }
  })

  /**
   * Compute GCD of two polynomial nodes.
   * @param {Node} pNode
   * @param {Node} qNode
   * @param {string} variable
   * @return {string}
   */
  function computeGCD (pNode, qNode, variable) {
    let p = extractCoeffs(pNode, variable)
    let q = extractCoeffs(qNode, variable)

    p = trimCoeffs(p)
    q = trimCoeffs(q)

    const gcd = polyGCD(p, q)
    return coeffsToString(gcd, variable)
  }

  /**
   * Euclidean GCD algorithm for polynomials.
   * @param {number[]} p
   * @param {number[]} q
   * @return {number[]}
   */
  function polyGCD (p, q) {
    p = trimCoeffs(p)
    q = trimCoeffs(q)

    while (q.length > 1 || Math.abs(q[0]) > 1e-9) {
      const r = trimCoeffs(polyRem(p, q))
      if (r.length === 1 && Math.abs(r[0]) < 1e-9) {
        return makeMonic(trimCoeffs(q))
      }
      p = q
      q = r
    }
    return [1]
  }

  /**
   * Polynomial remainder: p mod q.
   * @param {number[]} p  [c0, c1, ...]
   * @param {number[]} q
   * @return {number[]}
   */
  function polyRem (p, q) {
    p = p.slice()
    const lc = q[q.length - 1]

    while (p.length >= q.length) {
      const factor = p[p.length - 1] / lc
      const offset = p.length - q.length
      for (let i = 0; i < q.length; i++) {
        p[offset + i] -= factor * q[i]
      }
      p.pop()
      while (p.length > 1 && Math.abs(p[p.length - 1]) < 1e-10) p.pop()
    }
    return p
  }

  /**
   * Make polynomial monic (divide by leading coefficient).
   * @param {number[]} p
   * @return {number[]}
   */
  function makeMonic (p) {
    const lc = p[p.length - 1]
    if (Math.abs(lc) < 1e-12) return p
    return p.map(c => {
      const v = c / lc
      const r = Math.round(v)
      return Math.abs(v - r) < 1e-9 ? r + 0 : parseFloat(v.toPrecision(10))
    })
  }

  /**
   * Trim trailing near-zero coefficients.
   * @param {number[]} arr
   * @return {number[]}
   */
  function trimCoeffs (arr) {
    const a = arr.slice()
    while (a.length > 1 && Math.abs(a[a.length - 1]) < 1e-9) a.pop()
    return a
  }

  /**
   * Extract polynomial coefficients [c0, c1, c2, ...] from a node.
   * @param {Node} node
   * @param {string} variable
   * @return {number[]}
   */
  function extractCoeffs (node, variable) {
    const MAX_DEGREE = 10
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = {}
      scope[variable] = i
      let val
      try {
        val = node.evaluate(scope)
      } catch (e) {
        throw new Error('polynomialGCD: failed to evaluate polynomial: ' + e.message)
      }
      if (typeof val !== 'number' || !isFinite(val)) {
        throw new Error('polynomialGCD: expression must be a numeric polynomial')
      }
      values.push(val)
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

  /**
   * Solve Vandermonde system for polynomial coefficients.
   * @param {number[]} vals
   * @return {number[]}
   */
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

  /**
   * Build polynomial string from coefficients [c0, c1, ...].
   * @param {number[]} coeffs
   * @param {string} variable
   * @return {string}
   */
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
      if (terms[i].startsWith('-')) {
        result += ' - ' + terms[i].slice(1)
      } else {
        result += ' + ' + terms[i]
      }
    }
    return result
  }
})
