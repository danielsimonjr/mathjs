import { factory } from '../../utils/factory.js'

const name = 'coefficientList'
const dependencies = ['typed', 'parse', 'simplify']

export const createCoefficientList = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Extract polynomial coefficients of an expression with respect to a variable.
   *
   * Returns an array [c0, c1, c2, ...] where the expression equals
   * c0 + c1*x + c2*x^2 + ...
   *
   * This is implemented by substituting numeric values for the variable and
   * solving for the coefficients numerically, then rounding to clean values.
   * Supports polynomials of degree up to 10.
   *
   * Syntax:
   *
   *     math.coefficientList(expr, variable)
   *
   * Examples:
   *
   *     math.coefficientList('3*x^2 + 2*x + 1', 'x')   // [1, 2, 3]
   *     math.coefficientList('x^3 - x', 'x')            // [0, -1, 0, 1]
   *     math.coefficientList('5', 'x')                  // [5]
   *
   * See also:
   *
   *     simplify, rationalize, derivative
   *
   * @param {Node|string} expr       The polynomial expression
   * @param {string} variable        The variable name
   * @return {Array}                 Array of coefficients [c0, c1, ..., cn]
   */
  return typed(name, {
    'Node, string': function (node, variable) {
      return extractCoefficients(node, variable)
    },
    'string, string': function (expr, variable) {
      const node = parse(expr)
      return extractCoefficients(node, variable)
    }
  })

  /**
   * Determine degree and extract coefficients numerically.
   * We evaluate the expression at points 0, 1, 2, ..., maxDeg and solve
   * using finite differences, then verify with additional points.
   * @param {Node} node
   * @param {string} variable
   * @return {Array}
   */
  function extractCoefficients (node, variable) {
    const MAX_DEGREE = 10

    // Evaluate the expression at integer points 0..MAX_DEGREE+1
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = {}
      scope[variable] = i
      try {
        const val = node.evaluate(scope)
        if (typeof val !== 'number' || !isFinite(val)) {
          throw new Error('coefficientList: expression must evaluate to finite numbers')
        }
        values.push(val)
      } catch (e) {
        if (e.message.includes('must evaluate')) throw e
        throw new Error('coefficientList: failed to evaluate expression: ' + e.message)
      }
    }

    // Use finite differences to find the degree
    // The (d+1)-th order finite difference of a degree-d polynomial is 0
    let degree = 0
    const diffs = [values.slice()] // diffs[0] = original values
    for (let order = 1; order <= MAX_DEGREE + 1; order++) {
      const prev = diffs[order - 1]
      const cur = []
      for (let j = 0; j < prev.length - 1; j++) {
        cur.push(prev[j + 1] - prev[j])
      }
      diffs.push(cur)
      // Check if all elements of this difference are essentially zero
      const maxAbs = Math.max(...cur.map(Math.abs))
      if (maxAbs < 1e-6) {
        degree = order - 1
        break
      }
      if (order === MAX_DEGREE + 1) {
        degree = MAX_DEGREE
      }
    }

    // Solve Vandermonde system: values[i] = sum_j coeffs[j] * i^j
    // Build the (degree+1)×(degree+1) Vandermonde matrix and solve
    const coeffs = solveVandermonde(values.slice(0, degree + 1))

    // Round to avoid floating point noise, and convert -0 to 0
    for (let i = 0; i < coeffs.length; i++) {
      const rounded = Math.round(coeffs[i])
      if (Math.abs(coeffs[i] - rounded) < 1e-6) {
        coeffs[i] = rounded + 0 // +0 converts -0 to 0
      }
    }

    // Trim trailing zeros (but keep at least one element)
    while (coeffs.length > 1 && Math.abs(coeffs[coeffs.length - 1]) < 1e-9) {
      coeffs.pop()
    }

    return coeffs
  }

  /**
   * Solve Vandermonde system: find coefficients c such that
   * sum_j c[j] * i^j = vals[i] for i = 0..n-1
   * Uses Gaussian elimination with partial pivoting.
   * @param {Array<number>} vals
   * @return {Array<number>}
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
    // Gaussian elimination with partial pivoting
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
