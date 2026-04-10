import { factory } from '../../utils/factory.js'

const name = 'zTransform'
const dependencies = [
  'typed',
  'parse',
  'simplify'
]

export const createZTransform = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Compute the Z-transform of a discrete sequence using a lookup table.
   *
   * Supported patterns (where n is the sequence index, z is the Z-domain variable):
   *   - 1       → z / (z - 1)           (unit step)
   *   - n       → z / (z - 1)^2         (ramp)
   *   - a^n     → z / (z - a)           (geometric sequence)
   *   - n*a^n   → a*z / (z - a)^2       (n times geometric)
   *   - n^2     → z*(z+1) / (z-1)^3     (quadratic)
   *   - cos(w*n) → z*(z - cos(w)) / (z^2 - 2*cos(w)*z + 1)
   *   - sin(w*n) → z*sin(w) / (z^2 - 2*cos(w)*z + 1)
   *
   * Syntax:
   *
   *     math.zTransform(expr, nVar, zVar)
   *
   * Examples:
   *
   *     math.zTransform('1', 'n', 'z')
   *     math.zTransform('n', 'n', 'z')
   *     math.zTransform('0.5^n', 'n', 'z')
   *
   * See also:
   *
   *     inverseLaplaceTransform, laplace
   *
   * @param {string | Node} expr  The discrete sequence expression (function of nVar)
   * @param {string} nVar         The time-domain index variable (e.g. 'n')
   * @param {string} zVar         The Z-domain variable (e.g. 'z')
   * @return {string}             Z-domain expression as a string
   */
  return typed(name, {
    'string, string, string': (expr, nVar, zVar) =>
      _zTransform(expr, nVar, zVar),
    'Node, string, string': (expr, nVar, zVar) =>
      _zTransform(expr.toString(), nVar, zVar)
  })

  function _zTransform (exprStr, n, z) {
    const normalized = exprStr.replace(/\s+/g, '')

    // 1 (unit step)
    if (normalized === '1') {
      return z + ' / (' + z + ' - 1)'
    }

    // n (ramp)
    if (normalized === n) {
      return z + ' / (' + z + ' - 1)^2'
    }

    // n^2
    if (normalized === n + '^2') {
      return z + ' * (' + z + ' + 1) / (' + z + ' - 1)^3'
    }

    // a^n pattern: looks like X^n where X does not contain n
    const powNMatch = normalized.match(/^(.+)\^([a-zA-Z_]\w*)$/)
    if (powNMatch && powNMatch[2] === n) {
      const base = powNMatch[1]
      if (!base.includes(n)) {
        // a^n → z / (z - a)
        const aStr = _formatBase(base)
        return z + ' / (' + z + ' - ' + aStr + ')'
      }
    }

    // n*a^n pattern: n*X^n or X^n*n
    const nTimesAn = _matchNTimesAn(normalized, n)
    if (nTimesAn !== null) {
      // n*a^n → a*z / (z - a)^2
      const aStr = _formatBase(nTimesAn)
      return aStr + ' * ' + z + ' / (' + z + ' - ' + aStr + ')^2'
    }

    // cos(w*n) or cos(n*w)
    const cosMatch = _matchTrig(normalized, n, 'cos')
    if (cosMatch !== null) {
      const wStr = cosMatch
      return z + ' * (' + z + ' - cos(' + wStr + ')) / (' + z + '^2 - 2 * cos(' + wStr + ') * ' + z + ' + 1)'
    }

    // sin(w*n) or sin(n*w)
    const sinMatch = _matchTrig(normalized, n, 'sin')
    if (sinMatch !== null) {
      const wStr = sinMatch
      return z + ' * sin(' + wStr + ') / (' + z + '^2 - 2 * cos(' + wStr + ') * ' + z + ' + 1)'
    }

    // c (constant)
    if (!normalized.includes(n)) {
      // constant sequence c*u[n] → c * z / (z - 1)
      return '(' + normalized + ') * ' + z + ' / (' + z + ' - 1)'
    }

    throw new Error(
      'zTransform: pattern not recognized for expression "' + exprStr +
      '". Supported: 1, n, a^n, n*a^n, n^2, cos(w*n), sin(w*n).'
    )
  }

  function _formatBase (base) {
    // Remove wrapping parens if present
    if (base.startsWith('(') && base.endsWith(')')) {
      return base.slice(1, -1)
    }
    return base
  }

  function _matchNTimesAn (normalized, n) {
    // Match n*X^n or X^n*n
    const patterns = [
      new RegExp('^' + n + '\\*(.+)\\^' + n + '$'),
      new RegExp('^(.+)\\^' + n + '\\*' + n + '$')
    ]
    for (const re of patterns) {
      const m = normalized.match(re)
      if (m) {
        const base = m[1]
        if (!base.includes(n)) return base
      }
    }
    return null
  }

  function _matchTrig (normalized, n, fn) {
    // Match fn(w*n), fn(n*w), fn(n)
    const re1 = new RegExp('^' + fn + '\\((.+)\\*' + n + '\\)$')
    const re2 = new RegExp('^' + fn + '\\(' + n + '\\*(.+)\\)$')
    const re3 = new RegExp('^' + fn + '\\(' + n + '\\)$')
    let m
    m = normalized.match(re1)
    if (m && !m[1].includes(n)) return m[1]
    m = normalized.match(re2)
    if (m && !m[1].includes(n)) return m[1]
    if (re3.test(normalized)) return '1'
    return null
  }
})
