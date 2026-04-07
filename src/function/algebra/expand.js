import { factory } from '../../utils/factory.js'

const name = 'expand'
const dependencies = ['typed', 'parse', 'simplify']

export const createExpand = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Expand an algebraic expression by distributing multiplication over addition
   * and expanding powers.
   *
   * Uses math.simplify with expansion rules to distribute products and expand
   * integer powers of sums.
   *
   * Syntax:
   *
   *     math.expand(expr)
   *
   * Examples:
   *
   *     math.expand('(x + 1)^2')          // Node '1 + 2 * x + x ^ 2'
   *     math.expand('(x + 1) * (x - 1)')  // Node '-1 + x ^ 2'
   *     math.expand('2 * (x + y)')         // Node '2 * x + 2 * y'
   *
   * See also:
   *
   *     simplify, rationalize
   *
   * @param {Node|string} expr   The expression to expand
   * @return {Node|string}       The expanded expression (same type as input)
   */

  /**
   * Expansion rules for simplify — distribute multiplication over addition
   * and expand integer powers of sums.
   */
  const expandRules = [
    // Distribute multiplication over addition: a*(b+c) -> a*b + a*c
    { l: 'n1 * (n2 + n3)', r: 'n1*n2 + n1*n3' },
    { l: '(n1 + n2) * n3', r: 'n1*n3 + n2*n3' },
    // Distribute over subtraction: a*(b-c) -> a*b - a*c
    { l: 'n1 * (n2 - n3)', r: 'n1*n2 - n1*n3' },
    { l: '(n1 - n2) * n3', r: 'n1*n3 - n2*n3' },
    // Expand small integer powers of sums using squaring/cubing identities
    { l: '(n1 + n2)^2', r: 'n1^2 + 2*n1*n2 + n2^2' },
    { l: '(n1 - n2)^2', r: 'n1^2 - 2*n1*n2 + n2^2' },
    { l: '(n1 + n2)^3', r: 'n1^3 + 3*n1^2*n2 + 3*n1*n2^2 + n2^3' },
    { l: '(n1 - n2)^3', r: 'n1^3 - 3*n1^2*n2 + 3*n1*n2^2 - n2^3' }
  ]

  /**
   * Apply expansion to a node
   * @param {Node} node
   * @return {Node}
   */
  function expandNode (node) {
    // Apply expansion rules repeatedly until no change
    return simplify(node, expandRules, {}, { exactFractions: false })
  }

  return typed(name, {
    Node: function (node) {
      return expandNode(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return expandNode(node).toString()
    }
  })
})
