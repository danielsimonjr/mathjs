import { factory } from '../../utils/factory.js'

const name = 'fullSimplify'
const dependencies = ['typed', 'parse', 'simplify', 'expand', 'rationalize', 'leafCount']

export const createFullSimplify = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  expand,
  rationalize,
  leafCount
}) => {
  /**
   * Aggressively simplify an expression by applying multiple strategies in
   * sequence and returning the shortest result by leaf count.
   *
   * Strategies applied:
   * 1. Basic simplify
   * 2. Expand then simplify
   * 3. Rationalize then simplify
   * 4. Trig identity: sin(x)^2 + cos(x)^2 -> 1
   * 5. All of the above combined
   *
   * The result with the fewest nodes (leafCount) is returned.
   *
   * Syntax:
   *
   *     math.fullSimplify(expr)
   *     math.fullSimplify(expr, options)
   *
   * Examples:
   *
   *     math.fullSimplify('sin(x)^2 + cos(x)^2')   // '1'
   *     math.fullSimplify('(x^2 - 1) / (x - 1)')   // 'x + 1'
   *     math.fullSimplify('2*x + 3*x')              // '5 * x'
   *
   * See also:
   *
   *     simplify, expand, rationalize
   *
   * @param {Node|string} expr       The expression to simplify
   * @param {Object}      [options]  Options passed through to simplify
   * @return {Node|string}           The simplified expression (same type as input)
   */

  const trigRules = [
    { l: 'sin(n1)^2 + cos(n1)^2', r: '1' },
    { l: 'cos(n1)^2 + sin(n1)^2', r: '1' },
    { l: '1 - sin(n1)^2', r: 'cos(n1)^2' },
    { l: '1 - cos(n1)^2', r: 'sin(n1)^2' },
    { l: 'sin(n1)^2 - 1', r: '-cos(n1)^2' },
    { l: 'cos(n1)^2 - 1', r: '-sin(n1)^2' }
  ]

  const cancelRules = [
    { l: 'n1^2 - n2^2', r: '(n1 + n2) * (n1 - n2)' },
    { l: '(n1 - n2) / (n2 - n1)', r: '-1' }
  ]

  return typed(name, {
    string: function (expr) {
      const node = parse(expr)
      return _fullSimplify(node).toString()
    },
    Node: function (node) {
      return _fullSimplify(node)
    },
    'string, Object': function (expr, options) {
      const node = parse(expr)
      return _fullSimplify(node, options).toString()
    },
    'Node, Object': function (node, options) {
      return _fullSimplify(node, options)
    }
  })

  /**
   * Apply all simplification strategies and return the best result.
   * @param {Node} node
   * @param {Object} [options]
   * @return {Node}
   */
  function _fullSimplify (node, options) {
    const opts = options || {}
    const simplifyOpts = Object.assign({ exactFractions: false }, opts)

    const candidates = []

    // Strategy 1: basic simplify
    try {
      const s1 = simplify(node, [], {}, simplifyOpts)
      candidates.push(s1)
    } catch (e) { /* ignore */ }

    // Strategy 2: trig identities then simplify
    try {
      const allRules = [...trigRules]
      const s2 = simplify(node, allRules, {}, simplifyOpts)
      candidates.push(s2)
    } catch (e) { /* ignore */ }

    // Strategy 3: expand then simplify
    try {
      const expanded = expand(node)
      const s3 = simplify(expanded, [], {}, simplifyOpts)
      candidates.push(s3)
    } catch (e) { /* ignore */ }

    // Strategy 4: cancel/rationalize then simplify
    try {
      const s4 = simplify(node, cancelRules, {}, simplifyOpts)
      candidates.push(s4)
    } catch (e) { /* ignore */ }

    // Strategy 5: expand + trig + simplify
    try {
      const expanded2 = expand(node)
      const s5 = simplify(expanded2, trigRules, {}, simplifyOpts)
      candidates.push(s5)
    } catch (e) { /* ignore */ }

    // Strategy 6: rationalize
    try {
      const rat = rationalize(node, {}, true)
      const ratNode = typeof rat === 'string' ? parse(rat) : (rat.expression || rat)
      if (ratNode && ratNode.type) {
        const s6 = simplify(ratNode, [], {}, simplifyOpts)
        candidates.push(s6)
      }
    } catch (e) { /* ignore */ }

    if (candidates.length === 0) return node

    // Pick the candidate with fewest leaves
    let best = candidates[0]
    let bestCount = _safeLeafCount(best)
    for (let i = 1; i < candidates.length; i++) {
      const count = _safeLeafCount(candidates[i])
      if (count < bestCount) {
        bestCount = count
        best = candidates[i]
      }
    }

    return best
  }

  /**
   * Safely compute leaf count, returning Infinity on error.
   * @param {Node} node
   * @return {number}
   */
  function _safeLeafCount (node) {
    try {
      return leafCount(node)
    } catch (e) {
      return Infinity
    }
  }
})
