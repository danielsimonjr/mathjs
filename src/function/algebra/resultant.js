import { factory } from '../../utils/factory.js'

const name = 'resultant'
const dependencies = ['typed', 'parse', 'coefficientList']

export const createResultant = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  coefficientList
}) => {
  /**
   * Compute the resultant of two univariate polynomials.
   *
   * The resultant of p and q is the determinant of their Sylvester matrix.
   * It is zero if and only if p and q share a common root.
   * Used for polynomial elimination.
   *
   * Syntax:
   *
   *     math.resultant(p, q, variable)
   *
   * Examples:
   *
   *     math.resultant("x^2 - 1", "x^2 - 4", "x")
   *     math.resultant("x^2 - 1", "x - 1", "x")
   *     math.resultant("x^2 - 3*x + 2", "x - 1", "x")
   *
   * See also:
   *
   *     discriminant, polynomialGCD, eliminate
   *
   * @param {Node|string} p      First polynomial
   * @param {Node|string} q      Second polynomial
   * @param {string}      variable  The variable name
   * @return {number}            The resultant value
   */
  return typed(name, {
    'string, string, string': function (p, q, variable) {
      return computeResultant(parse(p), parse(q), variable)
    },
    'Node, Node, string': function (p, q, variable) {
      return computeResultant(p, q, variable)
    },
    'string, Node, string': function (p, q, variable) {
      return computeResultant(parse(p), q, variable)
    },
    'Node, string, string': function (p, q, variable) {
      return computeResultant(p, parse(q), variable)
    }
  })

  function computeResultant (pNode, qNode, variable) {
    const pCoeffs = coefficientList(pNode, variable)
    const qCoeffs = coefficientList(qNode, variable)
    return sylvesterResultant(pCoeffs, qCoeffs)
  }

  /**
   * Compute resultant via Sylvester matrix determinant.
   * @param {number[]} p  coefficients in ascending degree order [c0, c1, ...]
   * @param {number[]} q  coefficients in ascending degree order
   * @return {number}
   */
  function sylvesterResultant (p, q) {
    const m = p.length - 1 // degree of p
    const n = q.length - 1 // degree of q
    const size = m + n

    if (size === 0) return 1
    if (m === 0) return Math.pow(p[0], n)
    if (n === 0) return Math.pow(q[0], m)

    // Build Sylvester matrix of size (m+n) x (m+n)
    // Coefficients in descending order for Sylvester matrix convention
    const pDesc = p.slice().reverse()
    const qDesc = q.slice().reverse()

    const mat = []
    for (let i = 0; i < size; i++) {
      mat.push(new Array(size).fill(0))
    }

    // First n rows: shifted copies of p
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= m; j++) {
        if (i + j < size) mat[i][i + j] = pDesc[j]
      }
    }

    // Last m rows: shifted copies of q
    for (let i = 0; i < m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i + j < size) mat[n + i][i + j] = qDesc[j]
      }
    }

    return det(mat)
  }

  /**
   * Compute determinant via Gaussian elimination with partial pivoting.
   * @param {number[][]} mat
   * @return {number}
   */
  function det (mat) {
    const n = mat.length
    const A = mat.map(row => row.slice())
    let d = 1

    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
      }
      if (maxRow !== col) {
        const tmp = A[col]; A[col] = A[maxRow]; A[maxRow] = tmp
        d *= -1
      }
      if (Math.abs(A[col][col]) < 1e-14) return 0
      d *= A[col][col]
      for (let row = col + 1; row < n; row++) {
        const factor = A[row][col] / A[col][col]
        for (let k = col; k < n; k++) {
          A[row][k] -= factor * A[col][k]
        }
      }
    }
    return Math.round(d * 1e9) / 1e9
  }
})
