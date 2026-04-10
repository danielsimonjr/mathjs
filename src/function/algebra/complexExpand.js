import { factory } from '../../utils/factory.js'

const name = 'complexExpand'
const dependencies = ['typed', 'parse', 'simplify', 'expand']

export const createComplexExpand = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  expand
}) => {
  /**
   * Expand an expression treating variables as complex numbers.
   *
   * For each variable x in the provided list, introduces real and imaginary
   * parts x_re and x_im, substitutes x = x_re + i*x_im, expands the expression,
   * and separates into real and imaginary components.
   *
   * Syntax:
   *
   *     math.complexExpand(expr, variables)
   *
   * Examples:
   *
   *     math.complexExpand('z^2', ['z'])
   *     math.complexExpand('z * w', ['z', 'w'])
   *
   * See also:
   *
   *     expand, simplify
   *
   * @param {Node|string}  expr       The expression to expand
   * @param {string[]}     variables  List of variable names to treat as complex
   * @return {Object}                 Object with 're' and 'im' string properties
   */

  return typed(name, {
    'string, Array': function (expr, variables) {
      const node = parse(expr)
      return _complexExpand(node, variables)
    },
    'Node, Array': function (node, variables) {
      return _complexExpand(node, variables)
    }
  })

  /**
   * Expand an expression over real/imaginary parts for the given variables.
   * @param {Node} node
   * @param {string[]} variables
   * @return {{ re: string, im: string }}
   */
  function _complexExpand (node, variables) {
    // Build a substituted expression string by replacing each variable
    // with (varname_re + i * varname_im), then expand.
    let exprStr = node.toString()

    // For each variable, replace symbol with (v_re + i * v_im)
    for (const v of variables) {
      // Use word boundaries to only replace whole variable names
      const re = new RegExp(`\\b${v}\\b`, 'g')
      exprStr = exprStr.replace(re, `(${v}_re + i * ${v}_im)`)
    }

    // Expand the resulting expression
    let expanded
    try {
      expanded = expand(exprStr)
    } catch (e) {
      expanded = exprStr
    }

    // Now separate into real and imaginary parts by evaluating with i=sqrt(-1)
    // We do this symbolically: treat i as a symbol, collect terms with even/odd
    // powers of i. We use a numerical approach: evaluate at i=1 and i=-1
    // to separate real and imaginary parts algebraically.
    // Approach: use simplify to collect real/imaginary parts.
    const reResult = _extractRealPart(expanded, variables)
    const imResult = _extractImagPart(expanded, variables)

    return { re: reResult, im: imResult }
  }

  /**
   * Extract real part of a complex-expanded expression by substituting i=0
   * and keeping only real-part variable names.
   * @param {string} expr
   * @param {string[]} variables
   * @return {string}
   */
  function _extractRealPart (expr, variables) {
    // For real part: expand and collect terms where the total power of i is even
    // Heuristic: substitute i=0 would collapse imaginary, so we use i=1 and i=-1
    // Re(f) = (f(i=1) + f(i=-1)) / 2 — but these are symbolic, not numeric.
    // We use the simplify engine with rules that replace i^2 = -1, i^4 = 1, etc.
    const iRules = [
      { l: 'i^2', r: '-1' },
      { l: 'i^3', r: '-i' },
      { l: 'i^4', r: '1' },
      { l: 'i^0', r: '1' }
    ]

    try {
      // Apply i^2 = -1 repeatedly to get an expression in the form A + i*B
      const node = parse(expr)
      const simplified = simplify(node, iRules, {}, { exactFractions: false })
      const str = simplified.toString()

      // Attempt to separate: find terms without i
      return _collectTermsWithoutI(str)
    } catch (e) {
      return `Re(${expr})`
    }
  }

  /**
   * Extract imaginary part of a complex-expanded expression.
   * @param {string} expr
   * @param {string[]} variables
   * @return {string}
   */
  function _extractImagPart (expr, variables) {
    const iRules = [
      { l: 'i^2', r: '-1' },
      { l: 'i^3', r: '-i' },
      { l: 'i^4', r: '1' },
      { l: 'i^0', r: '1' }
    ]

    try {
      const node = parse(expr)
      const simplified = simplify(node, iRules, {}, { exactFractions: false })
      const str = simplified.toString()

      return _collectTermsWithI(str)
    } catch (e) {
      return `Im(${expr})`
    }
  }

  /**
   * Collect terms in a string expression that do NOT contain 'i'.
   * Simple token-based heuristic.
   * @param {string} expr
   * @return {string}
   */
  function _collectTermsWithoutI (expr) {
    // Split on top-level + and - to get terms
    const terms = _splitTopLevel(expr)
    const realTerms = terms.filter(t => !_containsI(t.term))
    if (realTerms.length === 0) return '0'
    return realTerms.map((t, idx) => idx === 0 ? t.sign + t.term : (t.sign === '-' ? ' - ' : ' + ') + t.term)
      .join('').replace(/^\+\s*/, '').replace(/^-\s*/, '-')
  }

  /**
   * Collect terms in a string expression that contain 'i', dividing out i.
   * @param {string} expr
   * @return {string}
   */
  function _collectTermsWithI (expr) {
    const terms = _splitTopLevel(expr)
    const imagTerms = terms.filter(t => _containsI(t.term))
    if (imagTerms.length === 0) return '0'
    // Remove the i factor from each term
    const stripped = imagTerms.map(t => {
      let term = t.term.replace(/\bi\b\s*\*\s*/g, '').replace(/\*\s*\bi\b/g, '').trim()
      if (term === '') term = '1'
      return { sign: t.sign, term }
    })
    return stripped.map((t, idx) => idx === 0 ? t.sign + t.term : (t.sign === '-' ? ' - ' : ' + ') + t.term)
      .join('').replace(/^\+\s*/, '').replace(/^-\s*/, '-')
  }

  /**
   * Check if a term string contains the imaginary unit 'i'.
   * @param {string} term
   * @return {boolean}
   */
  function _containsI (term) {
    return /\bi\b/.test(term)
  }

  /**
   * Split an expression string on top-level '+' and '-' operators.
   * Returns array of { sign, term } objects.
   * @param {string} expr
   * @return {Array<{ sign: string, term: string }>}
   */
  function _splitTopLevel (expr) {
    const terms = []
    let depth = 0
    let current = ''
    let sign = '+'

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i]
      if (ch === '(' || ch === '[') depth++
      else if (ch === ')' || ch === ']') depth--
      else if (depth === 0 && (ch === '+' || ch === '-') && i > 0) {
        if (current.trim()) terms.push({ sign, term: current.trim() })
        sign = ch
        current = ''
        continue
      }
      current += ch
    }
    if (current.trim()) terms.push({ sign, term: current.trim() })
    return terms
  }
})
