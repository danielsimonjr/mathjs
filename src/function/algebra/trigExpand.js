import { factory } from '../../utils/factory.js'

const name = 'trigExpand'
const dependencies = ['typed', 'parse', 'simplify']

export const createTrigExpand = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Expand trigonometric expressions using angle addition formulas.
   *
   * Applies the following identities:
   * - sin(a + b)  ->  sin(a)*cos(b) + cos(a)*sin(b)
   * - sin(a - b)  ->  sin(a)*cos(b) - cos(a)*sin(b)
   * - cos(a + b)  ->  cos(a)*cos(b) - sin(a)*sin(b)
   * - cos(a - b)  ->  cos(a)*cos(b) + sin(a)*sin(b)
   * - sin(2*x)    ->  2*sin(x)*cos(x)
   * - cos(2*x)    ->  cos(x)^2 - sin(x)^2
   * - tan(a + b)  ->  (tan(a) + tan(b)) / (1 - tan(a)*tan(b))
   *
   * Syntax:
   *
   *     math.trigExpand(expr)
   *
   * Examples:
   *
   *     math.trigExpand('sin(a + b)')   // 'sin(a) * cos(b) + cos(a) * sin(b)'
   *     math.trigExpand('cos(a + b)')   // 'cos(a) * cos(b) - sin(a) * sin(b)'
   *     math.trigExpand('sin(2 * x)')   // '2 * sin(x) * cos(x)'
   *
   * See also:
   *
   *     trigReduce, simplify
   *
   * @param {Node|string} expr   The expression to expand
   * @return {Node|string}       The expanded expression (same type as input)
   */

  const trigExpandRules = [
    // sin(a + b) -> sin(a)cos(b) + cos(a)sin(b)
    { l: 'sin(n1 + n2)', r: 'sin(n1) * cos(n2) + cos(n1) * sin(n2)' },
    // sin(a - b) -> sin(a)cos(b) - cos(a)sin(b)
    { l: 'sin(n1 - n2)', r: 'sin(n1) * cos(n2) - cos(n1) * sin(n2)' },
    // cos(a + b) -> cos(a)cos(b) - sin(a)sin(b)
    { l: 'cos(n1 + n2)', r: 'cos(n1) * cos(n2) - sin(n1) * sin(n2)' },
    // cos(a - b) -> cos(a)cos(b) + sin(a)sin(b)
    { l: 'cos(n1 - n2)', r: 'cos(n1) * cos(n2) + sin(n1) * sin(n2)' },
    // tan(a + b) -> (tan(a) + tan(b)) / (1 - tan(a)*tan(b))
    { l: 'tan(n1 + n2)', r: '(tan(n1) + tan(n2)) / (1 - tan(n1) * tan(n2))' },
    { l: 'tan(n1 - n2)', r: '(tan(n1) - tan(n2)) / (1 + tan(n1) * tan(n2))' },
    // Double angle: sin(2*x) -> 2*sin(x)*cos(x)
    { l: 'sin(2 * n1)', r: '2 * sin(n1) * cos(n1)' },
    { l: 'sin(n1 * 2)', r: '2 * sin(n1) * cos(n1)' },
    // Double angle: cos(2*x) -> cos(x)^2 - sin(x)^2
    { l: 'cos(2 * n1)', r: 'cos(n1)^2 - sin(n1)^2' },
    { l: 'cos(n1 * 2)', r: 'cos(n1)^2 - sin(n1)^2' },
    // tan(2*x) -> 2*tan(x)/(1 - tan(x)^2)
    { l: 'tan(2 * n1)', r: '2 * tan(n1) / (1 - tan(n1)^2)' },
    { l: 'tan(n1 * 2)', r: '2 * tan(n1) / (1 - tan(n1)^2)' }
  ]

  return typed(name, {
    Node: function (node) {
      return _trigExpand(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _trigExpand(node).toString()
    }
  })

  /**
   * Apply trig expansion rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _trigExpand (node) {
    return simplify(node, trigExpandRules, {}, { exactFractions: false })
  }
})
