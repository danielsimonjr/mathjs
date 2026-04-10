import { factory } from '../../utils/factory.js'

const name = 'powerExpand'
const dependencies = ['typed', 'parse', 'simplify']

export const createPowerExpand = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Expand powers and logarithms assuming arguments are positive real numbers.
   *
   * Distributes:
   * - (a*b)^n      ->  a^n * b^n
   * - (a/b)^n      ->  a^n / b^n
   * - (a^m)^n      ->  a^(m*n)
   * - sqrt(a*b)    ->  sqrt(a) * sqrt(b)
   * - log(a*b)     ->  log(a) + log(b)
   * - log(a/b)     ->  log(a) - log(b)
   * - log(a^n)     ->  n * log(a)
   *
   * Note: These identities assume all arguments are positive real numbers.
   * They may not hold in general for complex or negative values.
   *
   * Syntax:
   *
   *     math.powerExpand(expr)
   *
   * Examples:
   *
   *     math.powerExpand('(x * y)^3')   // 'x^3 * y^3'
   *     math.powerExpand('(a^2)^3')     // 'a ^ 6'
   *     math.powerExpand('log(x * y)')  // 'log(x) + log(y)'
   *
   * See also:
   *
   *     expand, simplify, combine
   *
   * @param {Node|string} expr   The expression to expand
   * @return {Node|string}       The expanded expression (same type as input)
   */

  const powerExpandRules = [
    // (a*b)^n -> a^n * b^n
    { l: '(n1 * n2)^n3', r: 'n1^n3 * n2^n3' },
    // (a/b)^n -> a^n / b^n
    { l: '(n1 / n2)^n3', r: 'n1^n3 / n2^n3' },
    // (a^m)^n -> a^(m*n)
    { l: '(n1^n2)^n3', r: 'n1^(n2 * n3)' },
    // sqrt(a*b) -> sqrt(a)*sqrt(b)
    { l: 'sqrt(n1 * n2)', r: 'sqrt(n1) * sqrt(n2)' },
    // log(a*b) -> log(a) + log(b)
    { l: 'log(n1 * n2)', r: 'log(n1) + log(n2)' },
    // log(a/b) -> log(a) - log(b)
    { l: 'log(n1 / n2)', r: 'log(n1) - log(n2)' },
    // log(a^n) -> n*log(a)
    { l: 'log(n1^n2)', r: 'n2 * log(n1)' },
    // log10 versions
    { l: 'log10(n1 * n2)', r: 'log10(n1) + log10(n2)' },
    { l: 'log10(n1 / n2)', r: 'log10(n1) - log10(n2)' },
    { l: 'log10(n1^n2)', r: 'n2 * log10(n1)' }
  ]

  return typed(name, {
    Node: function (node) {
      return _powerExpand(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _powerExpand(node).toString()
    }
  })

  /**
   * Apply power expansion rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _powerExpand (node) {
    return simplify(node, powerExpandRules, {}, { exactFractions: false })
  }
})
