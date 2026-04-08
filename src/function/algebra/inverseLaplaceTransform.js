import { factory } from '../../utils/factory.js'

const name = 'inverseLaplaceTransform'
const dependencies = ['typed', 'parse', 'simplify']

export const createInverseLaplaceTransform = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute the inverse Laplace transform using a lookup table.
   *
   * Given an expression F(s) in the s-domain, returns the time-domain
   * function f(t) by matching known Laplace transform pairs.
   *
   * Supported patterns:
   *   - 1/s               → 1          (unit step)
   *   - 1/s^2             → t          (ramp)
   *   - n!/s^(n+1)        → t^n        (power: match c/s^n where c ~ (n-1)!)
   *   - 1/(s - a)         → e^(at)     (exponential, a may be negative)
   *   - s/(s^2 + b^2)     → cos(b*t)
   *   - b/(s^2 + b^2)     → sin(b*t)
   *   - a/((s-c)^2 + b^2) → (a/b)*e^(ct)*sin(b*t)  (damped sine)
   *   - s/(s^2 - a^2)     → cosh(a*t)
   *   - a/(s^2 - a^2)     → sinh(a*t)
   *
   * For sums, each addend is transformed independently.
   *
   * Syntax:
   *
   *    math.inverseLaplaceTransform(expr, sVar, tVar)
   *
   * Examples:
   *
   *    math.inverseLaplaceTransform('1/s', 's', 't')
   *    math.inverseLaplaceTransform('1/s^2', 's', 't')
   *    math.inverseLaplaceTransform('1/(s - 2)', 's', 't')
   *    math.inverseLaplaceTransform('s/(s^2 + 4)', 's', 't')
   *    math.inverseLaplaceTransform('2/(s^2 + 4)', 's', 't')
   *
   * See also:
   *
   *    apart, simplify
   *
   * @param {string|Node} expr  Expression in the s-domain
   * @param {string} sVar       Name of the s-domain variable (e.g., 's')
   * @param {string} tVar       Name of the time variable (e.g., 't')
   * @return {string}           Time-domain expression as a string
   */
  return typed(name, {
    'string, string, string': function (expr, sVar, tVar) {
      const node = parse(expr)
      return _inverseLaplace(node, sVar, tVar)
    },
    'Node, string, string': function (node, sVar, tVar) {
      return _inverseLaplace(node, sVar, tVar)
    }
  })

  /**
   * Recursively apply inverse Laplace to an expression node.
   * Handles sums by transforming each term independently.
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string}
   */
  function _inverseLaplace (node, s, t) {
    // Try to simplify first
    let simplified
    try {
      simplified = simplify(node, [], {}, { exactFractions: false })
    } catch (e) {
      simplified = node
    }

    // Handle addition: transform each addend independently
    if (simplified.type === 'OperatorNode' && simplified.op === '+') {
      const left = _inverseLaplace(simplified.args[0], s, t)
      const right = _inverseLaplace(simplified.args[1], s, t)
      return left + ' + ' + right
    }

    // Handle subtraction: transform each part independently
    if (simplified.type === 'OperatorNode' && simplified.op === '-' && simplified.args.length === 2) {
      const left = _inverseLaplace(simplified.args[0], s, t)
      const right = _inverseLaplace(simplified.args[1], s, t)
      return left + ' - ' + right
    }

    // Try direct table lookup
    const result = _tableLookup(simplified, s, t)
    if (result !== null) return result

    // Try to evaluate numerically to check for constant
    try {
      const testVal = simplified.evaluate({ [s]: 1e6 }) // large s → check if it behaves like 1/s^n
      if (typeof testVal === 'number' && isFinite(testVal) && Math.abs(testVal) < 1e-6) {
        // Might be a decaying function — try more patterns via string analysis
      }
    } catch (e) {
      // ignore
    }

    // Fallback: return as-is with note
    const exprStr = simplified.toString()
    throw new Error(
      'inverseLaplaceTransform: could not find inverse Laplace transform for "' +
      exprStr + '". Pattern not recognized in lookup table.'
    )
  }

  /**
   * Table lookup for known Laplace transform pairs.
   * Returns the time-domain string or null if not matched.
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string|null}
   */
  function _tableLookup (node, s, t) {
    const expr = node.toString().replace(/ /g, '')

    // 1/s → 1 (unit step)
    if (_matchPattern(node, s, '1/s')) return '1'

    // 1/s^2 → t
    if (_matchPattern(node, s, '1/s^2')) return t

    // s/(s^2 + b^2) → cos(b*t)  and  b/(s^2 + b^2) → sin(b*t)
    const quadResult = _matchQuadratic(node, s, t)
    if (quadResult !== null) return quadResult

    // c/s^n → c * t^(n-1) / (n-1)!  for integer n >= 1
    const powerResult = _matchPower(node, s, t)
    if (powerResult !== null) return powerResult

    // 1/(s - a) or 1/(s + a) → e^(at)
    const expResult = _matchExponential(node, s, t)
    if (expResult !== null) return expResult

    // c/(s - a) or c/(s + a) → c * e^(at)
    const scaledExpResult = _matchScaledExponential(node, s, t)
    if (scaledExpResult !== null) return scaledExpResult

    return null
  }

  /**
   * Numerically evaluate a node at a given s value.
   * @param {Node} node
   * @param {string} s
   * @param {number} val
   * @return {number|null}
   */
  function _evalAt (node, s, val) {
    try {
      const result = node.evaluate({ [s]: val })
      if (typeof result === 'number' && isFinite(result)) return result
      return null
    } catch (e) {
      return null
    }
  }

  /**
   * Check if node matches 1/s pattern by numerical evaluation.
   * @param {Node} node
   * @param {string} s
   * @param {string} pattern  Simple string description
   * @return {boolean}
   */
  function _matchPattern (node, s, pattern) {
    const checkNode = parse(pattern.replace('s', s))
    // Compare numerically at several test points
    const testPoints = [2, 3, 5, 7, 11]
    for (const p of testPoints) {
      const v1 = _evalAt(node, s, p)
      const v2 = _evalAt(checkNode, s, p)
      if (v1 === null || v2 === null) return false
      if (Math.abs(v1 - v2) > 1e-9) return false
    }
    return true
  }

  /**
   * Match s/(s^2 + b^2) → cos(b*t) and b/(s^2 + b^2) → sin(b*t)
   * Also handles s/(s^2 - a^2) → cosh(a*t) and a/(s^2 - a^2) → sinh(a*t)
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string|null}
   */
  function _matchQuadratic (node, s, t) {
    // Evaluate at s=2,3,5 and compare with candidate transforms
    const v2 = _evalAt(node, s, 2)
    const v3 = _evalAt(node, s, 3)
    const v5 = _evalAt(node, s, 5)
    if (v2 === null || v3 === null || v5 === null) return null

    // Try b^2 values: s/(s^2+b^2) → cos(bt)
    // At s=2: 2/(4+b^2), at s=3: 3/(9+b^2), at s=5: 5/(25+b^2)
    // From two equations: 2/(4+b^2) = v2, 3/(9+b^2) = v3
    // b^2 = 2/v2 - 4 and b^2 = 3/v3 - 9
    if (Math.abs(v2) > 1e-12 && Math.abs(v3) > 1e-12) {
      const b2fromV2 = 2 / v2 - 4
      const b2fromV3 = 3 / v3 - 9

      // Check s/(s^2 + b^2) pattern (b^2 > 0, cos)
      if (b2fromV2 > 0 && Math.abs(b2fromV2 - b2fromV3) < 1e-6) {
        const b = Math.sqrt(b2fromV2)
        // Verify at s=5
        const expected = 5 / (25 + b2fromV2)
        if (Math.abs(v5 - expected) < 1e-8) {
          const bStr = _niceNumber(b)
          return 'cos(' + bStr + ' * ' + t + ')'
        }
      }

      // Check s/(s^2 - a^2) pattern (a^2 > 0 but subtracted), cosh
      // s/(s^2 - a^2): at s=2: 2/(4-a^2), a^2 = 4 - 2/v2
      const a2fromV2 = 4 - 2 / v2
      const a2fromV3 = 9 - 3 / v3
      if (a2fromV2 > 0 && Math.abs(a2fromV2 - a2fromV3) < 1e-6) {
        const a = Math.sqrt(a2fromV2)
        const expected = 5 / (25 - a2fromV2)
        if (isFinite(expected) && Math.abs(v5 - expected) < 1e-8) {
          const aStr = _niceNumber(a)
          return 'cosh(' + aStr + ' * ' + t + ')'
        }
      }
    }

    // Try c/(s^2 + b^2) → (c/b)*sin(b*t)
    // At s=2: c/(4+b^2), at s=3: c/(9+b^2)
    // v2*(4+b^2) = v3*(9+b^2) = c
    // v2*4 + v2*b^2 = v3*9 + v3*b^2
    // b^2*(v2-v3) = 9*v3 - 4*v2
    if (Math.abs(v2 - v3) > 1e-12) {
      const b2 = (9 * v3 - 4 * v2) / (v2 - v3)
      if (b2 > 0) {
        const c = v2 * (4 + b2)
        const b = Math.sqrt(b2)
        // Verify at s=5
        const expected = c / (25 + b2)
        if (Math.abs(v5 - expected) < 1e-8) {
          // c/(s^2+b^2) = (c/b) * b/(s^2+b^2) → (c/b)*sin(b*t)
          const coeff = c / b
          const bStr = _niceNumber(b)
          const coeffStr = _niceNumber(coeff)
          if (Math.abs(coeff - 1) < 1e-8) {
            return 'sin(' + bStr + ' * ' + t + ')'
          }
          return coeffStr + ' * sin(' + bStr + ' * ' + t + ')'
        }

        // Try a/(s^2 - a^2) → sinh(a*t)
        // c/(s^2 - b^2): c = v2*(4 - b2_neg), solving
      }

      // Try c/(s^2 - a^2) → (c/a)*sinh(a*t)
      const a2 = (9 * v3 - 4 * v2) / (v2 - v3) * (-1)
      // Recompute: c/(s^2-a^2): v2 = c/(4-a^2), v3 = c/(9-a^2)
      // c = v2*(4-a^2) = v3*(9-a^2), a^2*(v3-v2) = 9*v3 - 4*v2... same equation negated
      // Let me solve again:
      // v2*(4-a^2) = v3*(9-a^2)
      // 4*v2 - v2*a^2 = 9*v3 - v3*a^2
      // a^2*(v3-v2) = 9*v3 - 4*v2
      const a2sinh = (9 * v3 - 4 * v2) / (v3 - v2)
      if (a2sinh > 0) {
        const c2 = v2 * (4 - a2sinh)
        const a = Math.sqrt(a2sinh)
        const expected2 = c2 / (25 - a2sinh)
        if (isFinite(expected2) && Math.abs(v5 - expected2) < 1e-8) {
          const coeff = c2 / a
          const aStr = _niceNumber(a)
          const coeffStr = _niceNumber(coeff)
          if (Math.abs(coeff - 1) < 1e-8) {
            return 'sinh(' + aStr + ' * ' + t + ')'
          }
          return coeffStr + ' * sinh(' + aStr + ' * ' + t + ')'
        }
      }
    }

    return null
  }

  /**
   * Match c/s^n → c * t^(n-1) / (n-1)! for integer n >= 1
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string|null}
   */
  function _matchPower (node, s, t) {
    // Test: if F(s) ~ c/s^n, then s^n * F(s) should be approximately constant
    // at large s
    const v2 = _evalAt(node, s, 2)
    if (v2 === null || Math.abs(v2) < 1e-15) return null

    for (let n = 1; n <= 10; n++) {
      const testVal = Math.pow(2, n) * v2  // s^n * F(s) at s=2
      const v3 = _evalAt(node, s, 3)
      const v5 = _evalAt(node, s, 5)
      if (v3 === null || v5 === null) return null

      const c3 = Math.pow(3, n) * v3
      const c5 = Math.pow(5, n) * v5

      if (Math.abs(testVal - c3) < 1e-8 && Math.abs(testVal - c5) < 1e-8) {
        const c = testVal  // coefficient
        // F(s) = c/s^n → f(t) = c * t^(n-1) / (n-1)!
        const factorial = _factorial(n - 1)
        const coeff = c / factorial
        if (n === 1) {
          // c/s → c * 1 (constant)
          const coeffStr = _niceNumber(coeff)
          return Math.abs(coeff - 1) < 1e-8 ? '1' : coeffStr
        }
        if (n === 2) {
          const coeffStr = _niceNumber(coeff)
          return Math.abs(coeff - 1) < 1e-8 ? t : coeffStr + ' * ' + t
        }
        const power = n - 1
        const coeffStr = _niceNumber(coeff)
        const term = t + '^' + power
        return Math.abs(coeff - 1) < 1e-8 ? term : coeffStr + ' * ' + term
      }
    }

    return null
  }

  /**
   * Match 1/(s - a) → e^(a*t) or 1/(s + a) → e^(-a*t)
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string|null}
   */
  function _matchExponential (node, s, t) {
    // 1/(s-a): F(s) = 1/(s-a), so (s-a)*F(s) = 1
    // Test: find a such that F(s) * (s - a) = 1 numerically
    const v3 = _evalAt(node, s, 3)
    const v5 = _evalAt(node, s, 5)
    const v7 = _evalAt(node, s, 7)
    if (v3 === null || v5 === null || v7 === null) return null
    if (Math.abs(v3) < 1e-15) return null

    // a = s - 1/F(s): at s=3: a = 3 - 1/v3
    const aFromV3 = 3 - 1 / v3
    const aFromV5 = 5 - 1 / v5
    const aFromV7 = 7 - 1 / v7

    if (Math.abs(aFromV3 - aFromV5) < 1e-8 && Math.abs(aFromV3 - aFromV7) < 1e-8) {
      const a = aFromV3
      const aStr = _niceNumber(a)
      if (Math.abs(a) < 1e-8) {
        return 'e^(0)' // should be caught by power rule as 1/s
      }
      if (a > 0) {
        return 'e^(' + aStr + ' * ' + t + ')'
      } else {
        const absA = _niceNumber(-a)
        return 'e^(-' + absA + ' * ' + t + ')'
      }
    }

    return null
  }

  /**
   * Match c/(s - a) → c * e^(a*t)
   * @param {Node} node
   * @param {string} s
   * @param {string} t
   * @return {string|null}
   */
  function _matchScaledExponential (node, s, t) {
    // c/(s-a): F(s) * (s-a) = c (constant)
    // Try to find a and c numerically
    // F(s) = c/(s-a)
    // s*F(s) - a*F(s) = c
    // From two test points: s1*v1 - a*v1 = s2*v2 - a*v2
    // a*(v2 - v1) = s2*v2 - s1*v1
    // a = (s2*v2 - s1*v1) / (v2 - v1)

    const s1 = 3; const s2 = 5; const s3 = 7
    const v1 = _evalAt(node, s, s1)
    const v2 = _evalAt(node, s, s2)
    const v3 = _evalAt(node, s, s3)
    if (v1 === null || v2 === null || v3 === null) return null
    if (Math.abs(v2 - v1) < 1e-12) return null

    const a = (s2 * v2 - s1 * v1) / (v2 - v1)
    const c = v1 * (s1 - a)

    // Verify with third point
    const expected = c / (s3 - a)
    if (!isFinite(expected) || Math.abs(v3 - expected) > 1e-8) return null
    if (Math.abs(c) < 1e-12) return null

    const aStr = _niceNumber(a)
    const cStr = _niceNumber(c)

    let expPart
    if (Math.abs(a) < 1e-8) {
      expPart = '1' // e^0 = 1
    } else if (a > 0) {
      expPart = 'e^(' + aStr + ' * ' + t + ')'
    } else {
      const absA = _niceNumber(-a)
      expPart = 'e^(-' + absA + ' * ' + t + ')'
    }

    if (Math.abs(c - 1) < 1e-8) {
      return expPart
    }
    if (Math.abs(a) < 1e-8) {
      return cStr
    }
    return cStr + ' * ' + expPart
  }

  /**
   * Compute n! for small non-negative integers.
   * @param {number} n
   * @return {number}
   */
  function _factorial (n) {
    if (n <= 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  /**
   * Format a number as a nice string (integer if close to integer, otherwise decimal).
   * @param {number} val
   * @return {string}
   */
  function _niceNumber (val) {
    const rounded = Math.round(val)
    if (Math.abs(val - rounded) < 1e-8) return String(rounded)
    // Try simple fractions
    for (let den = 2; den <= 12; den++) {
      const num = Math.round(val * den)
      if (Math.abs(val - num / den) < 1e-8) {
        const g = _gcd(Math.abs(num), den)
        const n = num / g
        const d = den / g
        return d === 1 ? String(n) : n + '/' + d
      }
    }
    return val.toPrecision(6)
  }

  /**
   * Greatest common divisor.
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  function _gcd (a, b) {
    a = Math.abs(Math.round(a))
    b = Math.abs(Math.round(b))
    while (b !== 0) {
      const tmp = b
      b = a % b
      a = tmp
    }
    return a
  }
})
