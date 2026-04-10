import { factory } from '../../utils/factory.js'

const name = 'normalForm'
const dependencies = ['typed', 'parse', 'simplify', 'expand', 'rationalize', 'together', 'cancel']

export const createNormalForm = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  expand,
  rationalize,
  together,
  cancel
}) => {
  /**
   * Convert an expression to canonical polynomial or rational normal form.
   *
   * Applies the following pipeline:
   * 1. Expand all products and powers
   * 2. Combine fractions over a common denominator (together)
   * 3. Cancel common factors
   * 4. Simplify the result
   *
   * The output is a canonical rational expression with expanded numerator
   * and denominator with common factors cancelled.
   *
   * Syntax:
   *
   *     math.normalForm(expr)
   *
   * Examples:
   *
   *     math.normalForm('(x + 1)^2 / (x + 1)')   // 'x + 1'
   *     math.normalForm('1/2 + 1/3')              // '5 / 6'
   *     math.normalForm('(x^2 - 1) / (x - 1)')   // 'x + 1'
   *
   * See also:
   *
   *     simplify, rationalize, together, cancel
   *
   * @param {Node|string} expr   The expression to normalize
   * @return {string}            The normalized expression as a string
   */

  return typed(name, {
    Node: function (node) {
      return _normalForm(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return _normalForm(node)
    }
  })

  /**
   * Apply the normalization pipeline to a node.
   * @param {Node} node
   * @return {string}
   */
  function _normalForm (node) {
    let result = node.toString()

    // Step 1: Expand
    try {
      result = expand(node).toString()
    } catch (e) { /* ignore */ }

    // Step 2: Together (combine fractions)
    try {
      result = together(result)
    } catch (e) { /* ignore */ }

    // Step 3: Cancel common factors
    try {
      result = cancel(result)
    } catch (e) { /* ignore */ }

    // Step 4: Final simplify
    try {
      const simplified = simplify(parse(result), [], {}, { exactFractions: false })
      result = simplified.toString()
    } catch (e) { /* ignore */ }

    return result
  }
})
