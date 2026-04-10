import { factory } from '../../utils/factory.js'

const name = 'combine'
const dependencies = ['typed', 'parse', 'simplify']

export const createCombine = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Combine like terms and apply logarithm/power product rules.
   *
   * This is the inverse of expand for certain patterns:
   * - log(a) + log(b)  ->  log(a * b)
   * - log(a) - log(b)  ->  log(a / b)
   * - n * log(a)       ->  log(a^n)
   * - a^n * a^m        ->  a^(n + m)
   * - Like terms are combined (e.g. 2*x + 3*x -> 5*x)
   *
   * Syntax:
   *
   *     math.combine(expr)
   *
   * Examples:
   *
   *     math.combine('log(a) + log(b)')   // 'log(a * b)'
   *     math.combine('log(a) - log(b)')   // 'log(a / b)'
   *     math.combine('x^2 * x^3')         // 'x ^ 5'
   *     math.combine('2 * log(x)')        // 'log(x ^ 2)'
   *
   * See also:
   *
   *     expand, simplify
   *
   * @param {Node|string} expr   The expression to combine
   * @return {Node|string}       The combined expression (same type as input)
   */

  const combineRules = [
    // log product/quotient rules
    { l: 'log(n1) + log(n2)', r: 'log(n1 * n2)' },
    { l: 'log10(n1) + log10(n2)', r: 'log10(n1 * n2)' },
    { l: 'log(n1) - log(n2)', r: 'log(n1 / n2)' },
    { l: 'log10(n1) - log10(n2)', r: 'log10(n1 / n2)' },
    // n * log(a) -> log(a^n)
    { l: 'n1 * log(n2)', r: 'log(n2 ^ n1)' },
    { l: 'log(n2) * n1', r: 'log(n2 ^ n1)' },
    { l: 'n1 * log10(n2)', r: 'log10(n2 ^ n1)' },
    // Power product rules: a^n * a^m -> a^(n+m)
    { l: 'n1^n2 * n1^n3', r: 'n1 ^ (n2 + n3)' },
    // a * a^n -> a^(n+1)
    { l: 'n1 * n1^n2', r: 'n1 ^ (n2 + 1)' },
    { l: 'n1^n2 * n1', r: 'n1 ^ (n2 + 1)' },
    // a * a -> a^2
    { l: 'n1 * n1', r: 'n1 ^ 2' }
  ]

  return typed(name, {
    Node: function (node) {
      return _combine(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _combine(node).toString()
    }
  })

  /**
   * Apply combination rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _combine (node) {
    return simplify(node, combineRules, {}, { exactFractions: false })
  }
})
