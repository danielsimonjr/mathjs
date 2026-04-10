import { factory } from '../../utils/factory.js'

const name = 'trigReduce'
const dependencies = ['typed', 'parse', 'simplify']

export const createTrigReduce = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Reduce products of trigonometric functions to sums (inverse of trigExpand).
   *
   * Applies the product-to-sum identities:
   * - sin(a) * cos(b)  ->  (sin(a - b) + sin(a + b)) / 2
   * - cos(a) * cos(b)  ->  (cos(a - b) + cos(a + b)) / 2
   * - sin(a) * sin(b)  ->  (cos(a - b) - cos(a + b)) / 2
   * - sin(x)^2         ->  (1 - cos(2*x)) / 2
   * - cos(x)^2         ->  (1 + cos(2*x)) / 2
   * - tan(x)^2         ->  (1 - cos(2*x)) / (1 + cos(2*x))
   *
   * Syntax:
   *
   *     math.trigReduce(expr)
   *
   * Examples:
   *
   *     math.trigReduce('sin(x) * cos(x)')   // '(sin(x - x) + sin(x + x)) / 2'
   *     math.trigReduce('sin(x)^2')           // '(1 - cos(2 * x)) / 2'
   *     math.trigReduce('cos(x)^2')           // '(1 + cos(2 * x)) / 2'
   *
   * See also:
   *
   *     trigExpand, simplify
   *
   * @param {Node|string} expr   The expression to reduce
   * @return {Node|string}       The reduced expression (same type as input)
   */

  const trigReduceRules = [
    // sin^2(x) -> (1 - cos(2x)) / 2
    { l: 'sin(n1)^2', r: '(1 - cos(2 * n1)) / 2' },
    // cos^2(x) -> (1 + cos(2x)) / 2
    { l: 'cos(n1)^2', r: '(1 + cos(2 * n1)) / 2' },
    // tan^2(x) -> (1 - cos(2x))/(1 + cos(2x))
    { l: 'tan(n1)^2', r: '(1 - cos(2 * n1)) / (1 + cos(2 * n1))' },
    // sin(a)*cos(b) -> (sin(a-b) + sin(a+b))/2
    { l: 'sin(n1) * cos(n2)', r: '(sin(n1 - n2) + sin(n1 + n2)) / 2' },
    { l: 'cos(n2) * sin(n1)', r: '(sin(n1 - n2) + sin(n1 + n2)) / 2' },
    // cos(a)*cos(b) -> (cos(a-b) + cos(a+b))/2
    { l: 'cos(n1) * cos(n2)', r: '(cos(n1 - n2) + cos(n1 + n2)) / 2' },
    // sin(a)*sin(b) -> (cos(a-b) - cos(a+b))/2
    { l: 'sin(n1) * sin(n2)', r: '(cos(n1 - n2) - cos(n1 + n2)) / 2' }
  ]

  return typed(name, {
    Node: function (node) {
      return _trigReduce(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _trigReduce(node).toString()
    }
  })

  /**
   * Apply trig reduction rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _trigReduce (node) {
    return simplify(node, trigReduceRules, {}, { exactFractions: false })
  }
})
