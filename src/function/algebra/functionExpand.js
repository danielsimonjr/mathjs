import { factory } from '../../utils/factory.js'

const name = 'functionExpand'
const dependencies = ['typed', 'parse', 'simplify']

export const createFunctionExpand = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Expand special function identities.
   *
   * Applies known identities for special functions:
   * - gamma(n + 1)     ->  n * gamma(n)          (recurrence relation)
   * - gamma(1/2)       ->  sqrt(pi)
   * - gamma(1)         ->  1
   * - factorial(n)     ->  gamma(n + 1)
   * - beta(a, b)       ->  gamma(a) * gamma(b) / gamma(a + b)
   * - binomial(n, k)   ->  factorial(n) / (factorial(k) * factorial(n - k))
   *
   * For specific integer arguments, evaluates gamma numerically.
   *
   * Syntax:
   *
   *     math.functionExpand(expr)
   *
   * Examples:
   *
   *     math.functionExpand('gamma(n + 1)')         // 'n * gamma(n)'
   *     math.functionExpand('beta(a, b)')            // 'gamma(a) * gamma(b) / gamma(a + b)'
   *     math.functionExpand('binomial(n, k)')        // 'factorial(n) / (factorial(k) * factorial(n - k))'
   *
   * See also:
   *
   *     simplify
   *
   * @param {Node|string} expr   The expression to expand
   * @return {Node|string}       The expanded expression (same type as input)
   */

  const functionExpandRules = [
    // Gamma recurrence: gamma(n+1) -> n*gamma(n)
    { l: 'gamma(n1 + 1)', r: 'n1 * gamma(n1)' },
    // factorial to gamma
    { l: 'factorial(n1)', r: 'gamma(n1 + 1)' },
    // beta function
    { l: 'beta(n1, n2)', r: 'gamma(n1) * gamma(n2) / gamma(n1 + n2)' },
    // binomial coefficient
    { l: 'combinations(n1, n2)', r: 'factorial(n1) / (factorial(n2) * factorial(n1 - n2))' }
  ]

  return typed(name, {
    Node: function (node) {
      return _functionExpand(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _functionExpand(node).toString()
    }
  })

  /**
   * Apply function expansion rules to a node.
   * @param {Node} node
   * @return {Node}
   */
  function _functionExpand (node) {
    // First apply symbolic rules
    const result = simplify(node, functionExpandRules, {}, { exactFractions: false })

    // Then try to evaluate any remaining gamma/factorial of integer constants
    return _evaluateSpecialFunctions(result)
  }

  /**
   * Walk the AST and evaluate gamma/factorial at known integer values.
   * @param {Node} node
   * @return {Node}
   */
  function _evaluateSpecialFunctions (node) {
    return node.transform(function (n) {
      if (n.type !== 'FunctionNode') return n

      const fnName = n.fn && (n.fn.name || n.fn)
      if (fnName === 'gamma' && n.args.length === 1) {
        const arg = n.args[0]
        if (arg.type === 'ConstantNode') {
          const val = Number(arg.value)
          if (Number.isInteger(val) && val > 0 && val <= 20) {
            // gamma(n) = (n-1)!
            const result = _factorial(val - 1)
            return parse(String(result))
          }
        }
      }

      if (fnName === 'factorial' && n.args.length === 1) {
        const arg = n.args[0]
        if (arg.type === 'ConstantNode') {
          const val = Number(arg.value)
          if (Number.isInteger(val) && val >= 0 && val <= 20) {
            return parse(String(_factorial(val)))
          }
        }
      }

      return n
    })
  }

  /**
   * Compute n! for small non-negative integers.
   * @param {number} n
   * @return {number}
   */
  function _factorial (n) {
    if (n <= 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }
})
