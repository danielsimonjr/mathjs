import { factory } from '../../utils/factory.js'

const name = 'discriminant'
const dependencies = ['typed', 'parse', 'coefficientList']

export const createDiscriminant = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  coefficientList
}) => {
  /**
   * Compute the discriminant of a polynomial.
   *
   * For degree 2 (ax^2 + bx + c): disc = b^2 - 4*a*c
   * For degree 3 (ax^3 + bx^2 + cx + d): disc = 18abcd - 4b^3*d + b^2*c^2 - 4ac^3 - 27a^2*d^2
   * For degree 1: disc = 1 (always one root)
   * For higher degrees: computed via resultant of p and p'.
   *
   * Syntax:
   *
   *     math.discriminant(polynomial, variable)
   *
   * Examples:
   *
   *     math.discriminant("x^2 + 2*x + 1", "x")
   *     math.discriminant("x^2 - 4", "x")
   *     math.discriminant("x^2 - x - 6", "x")
   *
   * See also:
   *
   *     coefficientList, solve, resultant
   *
   * @param {Node|string} polynomial   The polynomial expression
   * @param {string}      variable     The variable name
   * @return {number}                  The discriminant value
   */
  return typed(name, {
    'string, string': function (polynomial, variable) {
      return computeDiscriminant(parse(polynomial), variable)
    },
    'Node, string': function (polynomial, variable) {
      return computeDiscriminant(polynomial, variable)
    }
  })

  function computeDiscriminant (polyNode, variable) {
    const coeffs = coefficientList(polyNode, variable)
    const deg = coeffs.length - 1

    if (deg === 0) {
      // Constant polynomial: discriminant is not defined
      throw new Error('discriminant: not defined for constant polynomials')
    }

    if (deg === 1) {
      // Linear: always exactly one root
      return 1
    }

    if (deg === 2) {
      const [c, b, a] = coeffs
      return b * b - 4 * a * c
    }

    if (deg === 3) {
      const [d, c, b, a] = coeffs
      return 18 * a * b * c * d - 4 * Math.pow(b, 3) * d + Math.pow(b, 2) * Math.pow(c, 2) - 4 * a * Math.pow(c, 3) - 27 * Math.pow(a, 2) * Math.pow(d, 2)
    }

    // For degree >= 4, use resultant(p, p')
    // p' = polyder(coeffs)
    const leadCoeff = coeffs[deg]
    if (leadCoeff === 0) {
      throw new Error('discriminant: leading coefficient is zero')
    }
    const derivCoeffs = _polyDeriv(coeffs)
    const res = _sylvesterResultant(coeffs, derivCoeffs)
    const n = deg
    const sign = Math.pow(-1, (n * (n - 1)) / 2)
    return sign * res / leadCoeff
  }

  /**
   * Compute polynomial derivative of coefficient array.
   * @param {number[]} coeffs
   * @return {number[]}
   */
  function _polyDeriv (coeffs) {
    if (coeffs.length <= 1) return [0]
    return coeffs.slice(1).map((c, i) => c * (i + 1))
  }

  /**
   * Compute resultant via Sylvester matrix determinant.
   * @param {number[]} p  coeffs in ascending degree
   * @param {number[]} q  coeffs in ascending degree
   * @return {number}
   */
  function _sylvesterResultant (p, q) {
    const m = p.length - 1
    const n = q.length - 1
    const size = m + n

    if (size === 0) return 1

    const mat = []
    for (let i = 0; i < size; i++) {
      const row = new Array(size).fill(0)
      mat.push(row)
    }

    // Fill Sylvester matrix with coefficients in descending degree order
    const pDesc = p.slice().reverse()
    const qDesc = q.slice().reverse()

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

    return _det(mat)
  }

  /**
   * Compute determinant via Gaussian elimination.
   * @param {number[][]} mat
   * @return {number}
   */
  function _det (mat) {
    const n = mat.length
    const A = mat.map(row => row.slice())
    let det = 1

    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
      }
      if (maxRow !== col) {
        const tmp = A[col]; A[col] = A[maxRow]; A[maxRow] = tmp
        det *= -1
      }
      if (Math.abs(A[col][col]) < 1e-14) return 0
      det *= A[col][col]
      for (let row = col + 1; row < n; row++) {
        const factor = A[row][col] / A[col][col]
        for (let k = col; k < n; k++) {
          A[row][k] -= factor * A[col][k]
        }
      }
    }
    return det
  }
})
