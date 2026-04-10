import { factory } from '../../utils/factory.js'

const name = 'collect'
const dependencies = ['typed', 'parse', 'simplify']

export const createCollect = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Collect terms of a polynomial expression by powers of a variable.
   *
   * Groups like powers of the given variable and combines their coefficients.
   * For example, 3*x + 2*x^2 + x becomes 2*x^2 + 4*x.
   *
   * Syntax:
   *
   *     math.collect(expr, variable)
   *
   * Examples:
   *
   *     math.collect('3*x + 2*x^2 + x + 5', 'x')   // '2 * x ^ 2 + 4 * x + 5'
   *     math.collect('a*x + b*x + c', 'x')           // '(a + b) * x + c'
   *     math.collect('x^2 + x^2', 'x')               // '2 * x ^ 2'
   *
   * See also:
   *
   *     simplify, expand
   *
   * @param {Node|string} expr       The expression to collect
   * @param {string} variable        The variable to collect by
   * @return {string}                The collected expression as a string
   */
  return typed(name, {
    'Node, string': function (node, variable) {
      return collectTerms(node, variable)
    },
    'string, string': function (expr, variable) {
      const node = parse(expr)
      return collectTerms(node, variable)
    }
  })

  /**
   * Collect terms of the expression by powers of the variable.
   * Uses numerical evaluation to determine coefficients of each power.
   * @param {Node} node
   * @param {string} variable
   * @return {string}
   */
  function collectTerms (node, variable) {
    const MAX_DEGREE = 8

    // Evaluate at enough points to determine degree and coefficients
    // We evaluate at two sets: integer points and points with a 'free' other variable
    // For simplicity, evaluate numerically assuming pure polynomial structure.
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = {}
      scope[variable] = i
      try {
        const val = node.evaluate(scope)
        if (typeof val !== 'number' || !isFinite(val)) {
          // Not a pure numeric polynomial — fall back to simplify
          return simplify(node, [], {}, { exactFractions: false }).toString()
        }
        values.push(val)
      } catch (e) {
        // Fall back to simplify
        return simplify(node, [], {}, { exactFractions: false }).toString()
      }
    }

    // Find degree using finite differences
    const degree = findDegree(values, MAX_DEGREE)

    // Extract coefficients via Vandermonde solve
    const coeffs = solveVandermonde(values.slice(0, degree + 1))

    // Round coefficients
    for (let i = 0; i < coeffs.length; i++) {
      const rounded = Math.round(coeffs[i])
      if (Math.abs(coeffs[i] - rounded) < 1e-6) {
        coeffs[i] = rounded + 0
      } else {
        // Round to 10 significant figures to clean up floats
        coeffs[i] = parseFloat(coeffs[i].toPrecision(10))
      }
    }

    // Build expression from coefficients (highest degree first)
    const terms = []
    for (let deg = coeffs.length - 1; deg >= 0; deg--) {
      const c = coeffs[deg]
      if (Math.abs(c) < 1e-10) continue

      let term
      if (deg === 0) {
        term = String(c)
      } else if (deg === 1) {
        if (c === 1) term = variable
        else if (c === -1) term = `-${variable}`
        else term = `${c} * ${variable}`
      } else {
        if (c === 1) term = `${variable} ^ ${deg}`
        else if (c === -1) term = `-${variable} ^ ${deg}`
        else term = `${c} * ${variable} ^ ${deg}`
      }
      terms.push(term)
    }

    if (terms.length === 0) return '0'

    // Join terms, inserting + or - appropriately
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
   * Find the degree of the polynomial from its values.
   * @param {number[]} values
   * @param {number} maxDeg
   * @return {number}
   */
  function findDegree (values, maxDeg) {
    const diffs = [values.slice()]
    for (let order = 1; order <= maxDeg + 1; order++) {
      const prev = diffs[order - 1]
      const cur = []
      for (let j = 0; j < prev.length - 1; j++) {
        cur.push(prev[j + 1] - prev[j])
      }
      diffs.push(cur)
      const maxAbs = cur.length > 0 ? Math.max(...cur.map(Math.abs)) : 0
      if (maxAbs < 1e-6) return order - 1
    }
    return maxDeg
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
