import { factory } from '../../utils/factory.js'

const name = 'polynomialRemainder'
const dependencies = ['typed', 'parse', 'simplify']

export const createPolynomialRemainder = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute the remainder of polynomial long division p / q.
   *
   * Divides polynomial p by polynomial q and returns the remainder polynomial.
   * Both polynomials must be univariate in the same variable.
   *
   * Syntax:
   *
   *     math.polynomialRemainder(p, q, variable)
   *
   * Examples:
   *
   *     math.polynomialRemainder('x^3 + 2*x + 1', 'x^2 + 1', 'x')   // 'x + 1'
   *     math.polynomialRemainder('x^3 - 1', 'x - 1', 'x')            // '0'
   *     math.polynomialRemainder('x^2 + 3*x + 2', 'x + 2', 'x')     // '0'
   *
   * See also:
   *
   *     polynomialQuotient, polynomialGCD, simplify
   *
   * @param {Node|string} p      Dividend polynomial
   * @param {Node|string} q      Divisor polynomial
   * @param {string} variable    The variable name
   * @return {string}            The remainder polynomial as a string
   */
  return typed(name, {
    'Node, Node, string': function (p, q, variable) {
      return dividePolynomials(p, q, variable).remainder
    },
    'string, string, string': function (p, q, variable) {
      return dividePolynomials(parse(p), parse(q), variable).remainder
    },
    'string, Node, string': function (p, q, variable) {
      return dividePolynomials(parse(p), q, variable).remainder
    },
    'Node, string, string': function (p, q, variable) {
      return dividePolynomials(p, parse(q), variable).remainder
    }
  })

  /**
   * Divide two polynomials and return quotient and remainder strings.
   * @param {Node} pNode
   * @param {Node} qNode
   * @param {string} variable
   * @return {{ quotient: string, remainder: string }}
   */
  function dividePolynomials (pNode, qNode, variable) {
    const pCoeffs = extractCoeffs(pNode, variable)
    const qCoeffs = extractCoeffs(qNode, variable)

    const { quot, rem } = polyDiv(pCoeffs, qCoeffs)

    return {
      quotient: coeffsToString(quot, variable),
      remainder: coeffsToString(rem, variable)
    }
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
        throw new Error('polynomialRemainder: failed to evaluate polynomial: ' + e.message)
      }
      if (typeof val !== 'number' || !isFinite(val)) {
        throw new Error('polynomialRemainder: expression must be a numeric polynomial')
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
   * Polynomial division: divide p by q, return quotient and remainder.
   * Coefficients are [c0, c1, c2, ...] (ascending degree order).
   * @param {number[]} p
   * @param {number[]} q
   * @return {{ quot: number[], rem: number[] }}
   */
  function polyDiv (p, q) {
    p = p.slice()
    const lc = q[q.length - 1]

    if (p.length < q.length) return { quot: [0], rem: p }

    const quotDeg = p.length - q.length
    const quot = new Array(quotDeg + 1).fill(0)

    while (p.length >= q.length) {
      const factor = p[p.length - 1] / lc
      const offset = p.length - q.length
      quot[offset] = factor
      for (let i = 0; i < q.length; i++) {
        p[offset + i] -= factor * q[i]
      }
      p.pop()
      while (p.length > 1 && Math.abs(p[p.length - 1]) < 1e-10) p.pop()
    }

    function roundArr (arr) {
      return arr.map(c => {
        const r = Math.round(c)
        return Math.abs(c - r) < 1e-9 ? r + 0 : parseFloat(c.toPrecision(10))
      })
    }

    return { quot: roundArr(quot), rem: roundArr(p) }
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
