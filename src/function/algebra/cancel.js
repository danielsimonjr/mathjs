import { factory } from '../../utils/factory.js'

const name = 'cancel'
const dependencies = ['typed', 'parse', 'simplify']

export const createCancel = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Cancel common factors in a rational expression.
   *
   * Simplifies a fraction by cancelling common factors between the numerator
   * and denominator. For example, (x^2 - 1) / (x - 1) simplifies to x + 1.
   *
   * Syntax:
   *
   *     math.cancel(expr)
   *
   * Examples:
   *
   *     math.cancel('(x^2 - 1) / (x - 1)')      // 'x + 1'
   *     math.cancel('(2*x^2 + 2*x) / (2*x)')    // 'x + 1'
   *     math.cancel('(x^3 - x) / x')             // 'x ^ 2 - 1'
   *
   * See also:
   *
   *     simplify, rationalize
   *
   * @param {Node|string} expr   The rational expression to cancel
   * @return {string}            The cancelled expression as a string
   */
  return typed(name, {
    Node: function (node) {
      return cancelExpr(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return cancelExpr(node)
    }
  })

  /**
   * Cancel common factors in a rational expression node.
   * @param {Node} node
   * @return {string}
   */
  function cancelExpr (node) {
    // First try: use simplify which handles many algebraic cancellations
    const cancellationRules = [
      // Factor differences of squares
      { l: 'n1^2 - n2^2', r: '(n1 + n2) * (n1 - n2)' },
      // Cancel x^n/x^m patterns (handled by simplify already)
      // Cancel (a-b)/(b-a) = -1
      { l: '(n1 - n2) / (n2 - n1)', r: '-1' },
      { l: '(n2 - n1) / (n1 - n2)', r: '-1' }
    ]

    const simplified = simplify(node, cancellationRules, {}, { exactFractions: false })

    // If the result still has a fraction, try polynomial GCD cancellation
    if (isRationalForm(simplified)) {
      const { numerator, denominator } = extractFraction(simplified)
      if (numerator && denominator) {
        const cancelled = tryPolynomialCancel(numerator, denominator)
        if (cancelled !== null) return cancelled
      }
    }

    return simplified.toString()
  }

  /**
   * Check if a node represents a division.
   * @param {Node} node
   * @return {boolean}
   */
  function isRationalForm (node) {
    return node.type === 'OperatorNode' && node.op === '/'
  }

  /**
   * Extract numerator and denominator from a division node.
   * @param {Node} node
   * @return {{ numerator: Node|null, denominator: Node|null }}
   */
  function extractFraction (node) {
    if (node.type === 'OperatorNode' && node.op === '/') {
      return { numerator: node.args[0], denominator: node.args[1] }
    }
    return { numerator: null, denominator: null }
  }

  /**
   * Evaluate a node at a specific variable value.
   * @param {Node} node
   * @param {string} variable
   * @param {number} value
   * @return {number|null}
   */
  function evalAt (node, variable, value) {
    try {
      const scope = {}
      scope[variable] = value
      const result = node.evaluate(scope)
      if (typeof result === 'number' && isFinite(result)) return result
      return null
    } catch (e) {
      return null
    }
  }

  /**
   * Try to determine the primary variable in a node.
   * @param {Node} node
   * @return {string|null}
   */
  function findVariable (node) {
    let varName = null
    node.traverse(function (n) {
      if (n.type === 'SymbolNode' && n.name !== 'e' && n.name !== 'pi' && n.name !== 'i') {
        varName = n.name
      }
    })
    return varName
  }

  /**
   * Extract polynomial coefficients by evaluating at integer points.
   * @param {Node} node
   * @param {string} variable
   * @param {number} maxDeg
   * @return {number[]|null} Coefficients [c0, c1, ...] or null on failure
   */
  function extractPolyCoeffs (node, variable, maxDeg) {
    const values = []
    for (let i = 0; i <= maxDeg + 1; i++) {
      const val = evalAt(node, variable, i)
      if (val === null) return null
      values.push(val)
    }

    // Find degree
    const diffs = [values.slice()]
    let degree = 0
    for (let order = 1; order <= maxDeg + 1; order++) {
      const prev = diffs[order - 1]
      const cur = []
      for (let j = 0; j < prev.length - 1; j++) cur.push(prev[j + 1] - prev[j])
      diffs.push(cur)
      const maxAbs = cur.length > 0 ? Math.max(...cur.map(Math.abs)) : 0
      if (maxAbs < 1e-6) { degree = order - 1; break }
      if (order === maxDeg + 1) degree = maxDeg
    }

    // Solve Vandermonde
    const coeffs = solveVandermonde(values.slice(0, degree + 1))
    for (let i = 0; i < coeffs.length; i++) {
      const r = Math.round(coeffs[i])
      coeffs[i] = Math.abs(coeffs[i] - r) < 1e-6 ? r + 0 : coeffs[i]
    }
    return coeffs
  }

  /**
   * Polynomial GCD via Euclidean algorithm on coefficient arrays.
   * @param {number[]} p
   * @param {number[]} q
   * @return {number[]}
   */
  function polyGCD (p, q) {
    // Trim leading zeros
    function trim (arr) {
      const a = arr.slice()
      while (a.length > 1 && Math.abs(a[a.length - 1]) < 1e-9) a.pop()
      return a
    }

    p = trim(p)
    q = trim(q)

    // Make monic
    function makeMonic (arr) {
      const lc = arr[arr.length - 1]
      return Math.abs(lc) < 1e-12 ? arr : arr.map(c => c / lc)
    }

    while (q.length > 1 || Math.abs(q[0]) > 1e-9) {
      const r = polyRem(p, q)
      const rt = trim(r)
      if (rt.length === 1 && Math.abs(rt[0]) < 1e-9) return makeMonic(trim(q))
      p = q
      q = trim(r)
    }
    return [1]
  }

  /**
   * Polynomial division remainder.
   * @param {number[]} p  dividend coefficients [c0, c1, ...]
   * @param {number[]} q  divisor coefficients
   * @return {number[]}
   */
  function polyRem (p, q) {
    p = p.slice()
    const degQ = q.length - 1
    const lc = q[degQ]
    while (p.length > q.length - 1) {
      const factor = p[p.length - 1] / lc
      const offset = p.length - q.length
      for (let i = 0; i < q.length; i++) {
        p[offset + i] -= factor * q[i]
      }
      p.pop()
    }
    return p
  }

  /**
   * Polynomial division quotient.
   * @param {number[]} p  dividend [c0, c1, ...]
   * @param {number[]} q  divisor
   * @return {number[]}
   */
  function polyDiv (p, q) {
    p = p.slice()
    const degQ = q.length - 1
    const lc = q[degQ]
    const quotientDeg = p.length - q.length
    if (quotientDeg < 0) return [0]
    const quot = new Array(quotientDeg + 1).fill(0)
    while (p.length > q.length - 1) {
      const factor = p[p.length - 1] / lc
      const offset = p.length - q.length
      quot[offset] = factor
      for (let i = 0; i < q.length; i++) {
        p[offset + i] -= factor * q[i]
      }
      p.pop()
    }
    return quot
  }

  /**
   * Build a polynomial string from coefficients.
   * @param {number[]} coeffs  [c0, c1, ...]
   * @param {string} variable
   * @return {string}
   */
  function coeffsToString (coeffs, variable) {
    const terms = []
    for (let deg = coeffs.length - 1; deg >= 0; deg--) {
      const c = coeffs[deg]
      if (Math.abs(c) < 1e-10) continue
      let term
      if (deg === 0) {
        term = String(Math.round(c * 1e9) / 1e9)
      } else if (deg === 1) {
        if (Math.abs(c - 1) < 1e-9) term = variable
        else if (Math.abs(c + 1) < 1e-9) term = `-${variable}`
        else term = `${Math.round(c * 1e9) / 1e9} * ${variable}`
      } else {
        if (Math.abs(c - 1) < 1e-9) term = `${variable} ^ ${deg}`
        else if (Math.abs(c + 1) < 1e-9) term = `-${variable} ^ ${deg}`
        else term = `${Math.round(c * 1e9) / 1e9} * ${variable} ^ ${deg}`
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

  /**
   * Try to cancel common polynomial factors.
   * @param {Node} numNode
   * @param {Node} denNode
   * @return {string|null}
   */
  function tryPolynomialCancel (numNode, denNode) {
    // Find the variable
    const variable = findVariable(numNode) || findVariable(denNode)
    if (!variable) return null

    const numCoeffs = extractPolyCoeffs(numNode, variable, 8)
    const denCoeffs = extractPolyCoeffs(denNode, variable, 8)
    if (!numCoeffs || !denCoeffs) return null

    const gcd = polyGCD(numCoeffs.slice(), denCoeffs.slice())

    // If GCD is trivial (degree 0), nothing to cancel
    if (gcd.length <= 1) return null

    const newNum = polyDiv(numCoeffs, gcd)
    const newDen = polyDiv(denCoeffs, gcd)

    // Check if denominator is now 1
    if (newDen.length === 1 && Math.abs(newDen[0] - 1) < 1e-9) {
      return coeffsToString(newNum, variable)
    }

    const numStr = coeffsToString(newNum, variable)
    const denStr = coeffsToString(newDen, variable)
    return `(${numStr}) / (${denStr})`
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
})
