import { factory } from '../../utils/factory.js'

const name = 'trigToExp'
const dependencies = ['typed', 'parse', 'simplify']

export const createTrigToExp = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Convert trigonometric and hyperbolic functions to exponential form.
   *
   * Applies the inverse of Euler's formula and hyperbolic definitions:
   * - sin(x)   ->  (exp(i*x) - exp(-i*x)) / (2*i)
   * - cos(x)   ->  (exp(i*x) + exp(-i*x)) / 2
   * - tan(x)   ->  -i * (exp(i*x) - exp(-i*x)) / (exp(i*x) + exp(-i*x))
   * - sinh(x)  ->  (exp(x) - exp(-x)) / 2
   * - cosh(x)  ->  (exp(x) + exp(-x)) / 2
   * - tanh(x)  ->  (exp(x) - exp(-x)) / (exp(x) + exp(-x))
   *
   * Syntax:
   *
   *     math.trigToExp(expr)
   *
   * Examples:
   *
   *     math.trigToExp('cos(x)')    // '(exp(i * x) + exp(-i * x)) / 2'
   *     math.trigToExp('sin(x)')    // '(exp(i * x) - exp(-i * x)) / (2 * i)'
   *     math.trigToExp('sinh(x)')   // '(exp(x) - exp(-x)) / 2'
   *
   * See also:
   *
   *     expToTrig, simplify
   *
   * @param {Node|string} expr   The expression to convert
   * @return {Node|string}       The converted expression (same type as input)
   */

  const trigToExpRules = [
    // sin(x) -> (exp(i*x) - exp(-i*x)) / (2*i)
    { l: 'sin(n1)', r: '(exp(i * n1) - exp(-i * n1)) / (2 * i)' },
    // cos(x) -> (exp(i*x) + exp(-i*x)) / 2
    { l: 'cos(n1)', r: '(exp(i * n1) + exp(-i * n1)) / 2' },
    // tan(x) -> -i*(exp(i*x) - exp(-i*x))/(exp(i*x) + exp(-i*x))
    { l: 'tan(n1)', r: '-i * (exp(i * n1) - exp(-i * n1)) / (exp(i * n1) + exp(-i * n1))' },
    // sinh(x) -> (exp(x) - exp(-x)) / 2
    { l: 'sinh(n1)', r: '(exp(n1) - exp(-n1)) / 2' },
    // cosh(x) -> (exp(x) + exp(-x)) / 2
    { l: 'cosh(n1)', r: '(exp(n1) + exp(-n1)) / 2' },
    // tanh(x) -> (exp(x) - exp(-x)) / (exp(x) + exp(-x))
    { l: 'tanh(n1)', r: '(exp(n1) - exp(-n1)) / (exp(n1) + exp(-n1))' }
  ]

  return typed(name, {
    Node: function (node) {
      return _trigToExp(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _trigToExp(node).toString()
    }
  })

  /**
   * Apply trig-to-exp conversion rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _trigToExp (node) {
    return simplify(node, trigToExpRules, {}, { exactFractions: false })
  }
})
