import { factory } from '../../utils/factory.js'

const name = 'polynomialLCM'
const dependencies = ['typed', 'parse', 'polynomialGCD', 'polymul']

export const createPolynomialLCM = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  polynomialGCD,
  polymul
}) => {
  /**
   * Compute the Least Common Multiple (LCM) of two polynomials.
   *
   * LCM(p, q) = p * q / GCD(p, q)
   *
   * The result is normalized to be monic (leading coefficient 1).
   *
   * Syntax:
   *
   *     math.polynomialLCM(p, q, variable)
   *
   * Examples:
   *
   *     math.polynomialLCM("x^2 - 1", "x^2 - 2*x + 1", "x")
   *     math.polynomialLCM("x^2 - 1", "x + 1", "x")
   *
   * See also:
   *
   *     polynomialGCD, polynomialQuotient, polynomialRemainder
   *
   * @param {Node|string} p      First polynomial
   * @param {Node|string} q      Second polynomial
   * @param {string}      variable  The variable name
   * @return {string}            The LCM polynomial as a string (monic)
   */
  return typed(name, {
    'string, string, string': function (p, q, variable) {
      return computeLCM(parse(p), parse(q), variable)
    },
    'Node, Node, string': function (p, q, variable) {
      return computeLCM(p, q, variable)
    },
    'string, Node, string': function (p, q, variable) {
      return computeLCM(parse(p), q, variable)
    },
    'Node, string, string': function (p, q, variable) {
      return computeLCM(p, parse(q), variable)
    }
  })

  function computeLCM (pNode, qNode, variable) {
    const pCoeffs = extractCoeffs(pNode, variable)
    const qCoeffs = extractCoeffs(qNode, variable)

    const gcdStr = polynomialGCD(pNode, qNode, variable)
    const gcdCoeffs = extractCoeffsByEval(parse(gcdStr), variable)

    // product = p * q
    const productCoeffs = polymul(pCoeffs, qCoeffs)

    // LCM = product / GCD
    const lcmCoeffs = polyDiv(productCoeffs, gcdCoeffs)
    const monic = makeMonic(trimCoeffs(lcmCoeffs))
    return coeffsToString(monic, variable)
  }

  function extractCoeffs (node, variable) {
    return extractCoeffsByEval(node, variable)
  }

  function extractCoeffsByEval (node, variable) {
    const MAX_DEGREE = 10
    const values = []
    for (let i = 0; i <= MAX_DEGREE + 1; i++) {
      const scope = {}
      scope[variable] = i
      const val = node.evaluate(scope)
      values.push(typeof val === 'number' ? val : Number(val))
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
   * Polynomial exact division: p / q (assumes q divides p exactly).
   * Uses long division keeping track of degree positions explicitly.
   * @param {number[]} p  coefficients in ascending degree [c0, c1, ...]
   * @param {number[]} q  coefficients in ascending degree
   * @return {number[]}   quotient coefficients in ascending degree
   */
  function polyDiv (p, q) {
    // Dividing by a scalar (degree-0 divisor)
    if (q.length === 1) {
      const scalar = q[0]
      if (Math.abs(scalar) < 1e-14) throw new Error('polynomialLCM: division by zero polynomial')
      return p.map(c => {
        const v = c / scalar
        const r = Math.round(v)
        return Math.abs(v - r) < 1e-9 ? r + 0 : v
      })
    }

    const degP = p.length - 1
    const degQ = q.length - 1

    if (degP < degQ) return [0]

    const degResult = degP - degQ
    const quotient = new Array(degResult + 1).fill(0)
    const remainder = p.slice()

    for (let i = degResult; i >= 0; i--) {
      const coeff = remainder[i + degQ] / q[degQ]
      quotient[i] = coeff
      for (let j = 0; j <= degQ; j++) {
        remainder[i + j] -= coeff * q[j]
      }
    }

    // Clean up near-zero values
    for (let i = 0; i < quotient.length; i++) {
      const r = Math.round(quotient[i])
      quotient[i] = Math.abs(quotient[i] - r) < 1e-9 ? r + 0 : quotient[i]
    }

    return quotient
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
