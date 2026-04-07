import { factory } from '../../utils/factory.js'

const name = 'apart'
const dependencies = ['typed', 'parse', 'simplify']

export const createApart = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Perform partial fraction decomposition on a rational expression.
   *
   * Decomposes a rational function p(x)/q(x) into a sum of simpler fractions.
   * Currently handles cases where the denominator factors into distinct linear terms
   * or where the expression simplifies directly.
   *
   * Syntax:
   *
   *     math.apart(expr, variable)
   *
   * Examples:
   *
   *     math.apart('1 / (x^2 - 1)', 'x')    // '1/2 * 1/(x - 1) + -1/2 * 1/(x + 1)'
   *     math.apart('(x + 1) / (x^2 - 1)', 'x')  // '1 / (x - 1)'
   *
   * See also:
   *
   *     simplify, rationalize
   *
   * @param {Node|string} expr    The rational expression to decompose
   * @param {string} variable     The variable name
   * @return {string}             Partial fraction decomposition as a string
   */
  return typed(name, {
    'Node, string': function (node, variable) {
      return apartExpr(node, variable)
    },
    'string, string': function (expr, variable) {
      const node = parse(expr)
      return apartExpr(node, variable)
    }
  })

  /**
   * Perform the partial fraction decomposition.
   * @param {Node} node
   * @param {string} variable
   * @return {string}
   */
  function apartExpr (node, variable) {
    // First, try simplifying — if the expression simplifies nicely, return it
    const simplified = simplify(node, [], {}, { exactFractions: false })
    const simplifiedStr = simplified.toString().replace(/ /g, '')

    // Check if the result is a fraction (has division)
    if (!isRationalForm(simplified)) {
      // Not a fraction — already in simplest form
      return simplified.toString()
    }

    // Try to extract numerator and denominator
    const { numerator, denominator } = extractFraction(simplified)
    if (!numerator || !denominator) {
      return simplified.toString()
    }

    const denomStr = denominator.toString().replace(/ /g, '')
    const numerStr = numerator.toString().replace(/ /g, '')

    // Find linear factors of the denominator by evaluating at roots
    // We try to factor the denominator as a product of linear terms
    // using the rational root theorem with small integer roots
    const roots = findLinearRoots(denominator, variable)

    if (roots.length === 0) {
      // Could not factor denominator — return simplified form
      return simplified.toString()
    }

    // Verify all roots are distinct (we handle only simple poles here)
    const uniqueRoots = [...new Set(roots.map(r => Math.round(r * 1e9) / 1e9))]
    if (uniqueRoots.length !== roots.length) {
      // Repeated roots — not yet supported
      throw new Error('apart: repeated roots in denominator are not yet supported')
    }

    // Compute residues A_i = lim_{x->r_i} (x - r_i) * f(x)
    // For simple poles: A_i = p(r_i) / q'(r_i)
    const terms = []
    for (const root of uniqueRoots) {
      const residue = computeResidue(numerator, denominator, root, variable)
      if (!isFinite(residue) || Math.abs(residue) < 1e-12) continue

      // Round residue to nice fraction
      const frac = toNiceFraction(residue)
      const rootFrac = toNiceFraction(root)
      const sign = root < 0 ? '+' : '-'
      const absRoot = toNiceFraction(Math.abs(root))
      const term = `${frac} / (${variable} ${sign} ${absRoot})`
      terms.push(term)
    }

    if (terms.length === 0) {
      return simplified.toString()
    }

    return terms.join(' + ')
  }

  /**
   * Check if a node represents a rational fraction (contains division at top level)
   * @param {Node} node
   * @return {boolean}
   */
  function isRationalForm (node) {
    return node.type === 'OperatorNode' && node.op === '/'
  }

  /**
   * Extract numerator and denominator from a division node
   * @param {Node} node
   * @return {{numerator: Node|null, denominator: Node|null}}
   */
  function extractFraction (node) {
    if (node.type === 'OperatorNode' && node.op === '/') {
      return { numerator: node.args[0], denominator: node.args[1] }
    }
    return { numerator: null, denominator: null }
  }

  /**
   * Find roots of the denominator by testing small integers and rationals
   * @param {Node} denomNode
   * @param {string} variable
   * @return {Array<number>}
   */
  function findLinearRoots (denomNode, variable) {
    const roots = []
    // Test candidate roots from -20 to 20 and simple fractions
    const candidates = []
    for (let i = -20; i <= 20; i++) {
      candidates.push(i)
    }
    // Also try half-integer values
    for (let i = -10; i <= 10; i++) {
      candidates.push(i + 0.5)
      candidates.push(i / 2)
    }

    for (const c of candidates) {
      const val = evalAt(denomNode, variable, c)
      if (val !== null && Math.abs(val) < 1e-8) {
        // c is a root — check if it's not already found
        const alreadyFound = roots.some(r => Math.abs(r - c) < 1e-8)
        if (!alreadyFound) {
          roots.push(c)
        }
      }
    }

    return roots
  }

  /**
   * Evaluate a node at a specific value of the variable
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
   * Numerically differentiate a node
   * @param {Node} node
   * @param {string} variable
   * @param {number} x
   * @return {number|null}
   */
  function numericalDerivative (node, variable, x) {
    const h = 1e-6
    const fph = evalAt(node, variable, x + h)
    const fmh = evalAt(node, variable, x - h)
    if (fph === null || fmh === null) return null
    return (fph - fmh) / (2 * h)
  }

  /**
   * Compute residue A_i = p(root) / q'(root) for simple pole at root
   * @param {Node} numerNode
   * @param {Node} denomNode
   * @param {number} root
   * @param {string} variable
   * @return {number}
   */
  function computeResidue (numerNode, denomNode, root, variable) {
    const pVal = evalAt(numerNode, variable, root)
    const qPrime = numericalDerivative(denomNode, variable, root)
    if (pVal === null || qPrime === null || Math.abs(qPrime) < 1e-10) {
      return NaN
    }
    return pVal / qPrime
  }

  /**
   * Convert a floating point number to a nice fraction string
   * e.g., 0.5 -> '1/2', -0.333... -> '-1/3', 2 -> '2'
   * @param {number} val
   * @return {string}
   */
  function toNiceFraction (val) {
    if (Math.abs(val - Math.round(val)) < 1e-8) {
      return String(Math.round(val))
    }
    // Try denominators 2..12
    for (let den = 2; den <= 12; den++) {
      const num = Math.round(val * den)
      if (Math.abs(val - num / den) < 1e-8) {
        const g = gcd(Math.abs(num), den)
        const n = num / g
        const d = den / g
        return d === 1 ? String(n) : `${n}/${d}`
      }
    }
    // Return as decimal
    return val.toPrecision(6)
  }

  /**
   * Greatest common divisor
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  function gcd (a, b) {
    a = Math.abs(Math.round(a))
    b = Math.abs(Math.round(b))
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }
})
