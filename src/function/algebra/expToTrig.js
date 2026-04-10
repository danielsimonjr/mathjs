import { factory } from '../../utils/factory.js'

const name = 'expToTrig'
const dependencies = ['typed', 'parse', 'simplify']

export const createExpToTrig = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Convert exponential expressions to trigonometric/hyperbolic form.
   *
   * Applies Euler's formula and hyperbolic identities:
   * - exp(i*x)               ->  cos(x) + i*sin(x)
   * - exp(-i*x)              ->  cos(x) - i*sin(x)
   * - (exp(x) + exp(-x))/2  ->  cosh(x)
   * - (exp(x) - exp(-x))/2  ->  sinh(x)
   *
   * Syntax:
   *
   *     math.expToTrig(expr)
   *
   * Examples:
   *
   *     math.expToTrig('exp(i * x)')   // 'cos(x) + i * sin(x)'
   *
   * See also:
   *
   *     trigToExp, simplify
   *
   * @param {Node|string} expr   The expression to convert
   * @return {Node|string}       The converted expression (same type as input)
   */

  const expToTrigRules = [
    // exp(i*x) -> cos(x) + i*sin(x)
    { l: 'exp(i * n1)', r: 'cos(n1) + i * sin(n1)' },
    { l: 'exp(n1 * i)', r: 'cos(n1) + i * sin(n1)' },
    // exp(-i*x) -> cos(x) - i*sin(x)
    { l: 'exp(-i * n1)', r: 'cos(n1) - i * sin(n1)' },
    { l: 'exp(-(i * n1))', r: 'cos(n1) - i * sin(n1)' },
    { l: 'exp(i * (-n1))', r: 'cos(n1) - i * sin(n1)' },
    // hyperbolic: (exp(x) + exp(-x))/2 -> cosh(x)
    { l: '(exp(n1) + exp(-n1)) / 2', r: 'cosh(n1)' },
    { l: '(exp(-n1) + exp(n1)) / 2', r: 'cosh(n1)' },
    // hyperbolic: (exp(x) - exp(-x))/2 -> sinh(x)
    { l: '(exp(n1) - exp(-n1)) / 2', r: 'sinh(n1)' }
  ]

  return typed(name, {
    Node: function (node) {
      return _expToTrig(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _expToTrig(node).toString()
    }
  })

  /**
   * Apply exp-to-trig conversion rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _expToTrig (node) {
    return simplify(node, expToTrigRules, {}, { exactFractions: false })
  }
})
