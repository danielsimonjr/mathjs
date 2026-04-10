import { factory } from '../../utils/factory.js'

const name = 'together'
const dependencies = ['typed', 'parse', 'simplify', 'rationalize']

export const createTogether = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  rationalize
}) => {
  /**
   * Combine fractions over a common denominator.
   *
   * This is the inverse of `apart`: it takes a sum of fractions and combines
   * them into a single rational expression. Uses `rationalize` to combine
   * fractions and `simplify` to reduce the result.
   *
   * Syntax:
   *
   *     math.together(expr)
   *
   * Examples:
   *
   *     math.together('1/(x-1) + 1/(x+1)')   // '2*x / (x^2 - 1)' or equivalent
   *     math.together('1/x + 1/y')            // '(x + y) / (x * y)' or equivalent
   *     math.together('a/b + c/d')            // '(a*d + b*c) / (b*d)' or equivalent
   *
   * See also:
   *
   *     apart, simplify, rationalize
   *
   * @param {Node|string} expr   The expression to combine
   * @return {string}            The combined expression as a string
   */
  return typed(name, {
    Node: function (node) {
      return combineNode(node)
    },
    string: function (expr) {
      const node = parse(expr)
      return combineNode(node)
    }
  })

  /**
   * Combine fractions in a node over a common denominator.
   * @param {Node} node
   * @return {string}
   */
  function combineNode (node) {
    // Walk the AST and collect numerator/denominator contributions
    const { num, den } = collectFraction(node)

    if (den === null) {
      // No fractions found — just simplify
      const s = simplify(node, [], {}, { exactFractions: false })
      return s.toString()
    }

    // Build combined fraction: num / den, then simplify
    const combined = `(${num}) / (${den})`
    try {
      const s = simplify(parse(combined), [], {}, { exactFractions: false })
      return s.toString()
    } catch (e) {
      return combined
    }
  }

  /**
   * Recursively collect the numerator and denominator of a sum of fractions.
   * Returns { num: string, den: string|null }.
   * @param {Node} node
   * @return {{ num: string, den: string|null }}
   */
  function collectFraction (node) {
    if (node.type === 'OperatorNode' && node.op === '+') {
      const left = collectFraction(node.args[0])
      const right = collectFraction(node.args[1])
      return combineParts(left, right, '+')
    }

    if (node.type === 'OperatorNode' && node.op === '-' && node.args.length === 2) {
      const left = collectFraction(node.args[0])
      const right = collectFraction(node.args[1])
      return combineParts(left, right, '-')
    }

    if (node.type === 'OperatorNode' && node.op === '/') {
      const numStr = node.args[0].toString()
      const denStr = node.args[1].toString()
      return { num: numStr, den: denStr }
    }

    // Leaf or non-fraction: treat as numerator/1
    return { num: node.toString(), den: null }
  }

  /**
   * Combine two (num, den) parts with an operator (+/-).
   * @param {{ num: string, den: string|null }} left
   * @param {{ num: string, den: string|null }} right
   * @param {string} op
   * @return {{ num: string, den: string|null }}
   */
  function combineParts (left, right, op) {
    if (left.den === null && right.den === null) {
      return { num: `${left.num} ${op} ${right.num}`, den: null }
    }

    if (left.den === null) {
      // left: num/1, right: rnum/rden
      // result: (left.num * right.den op right.num) / right.den
      const newNum = op === '+'
        ? `${left.num} * (${right.den}) + ${right.num}`
        : `${left.num} * (${right.den}) - ${right.num}`
      return { num: newNum, den: right.den }
    }

    if (right.den === null) {
      // left: lnum/lden, right: num/1
      // result: (left.num op right.num * left.den) / left.den
      const newNum = op === '+'
        ? `${left.num} + ${right.num} * (${left.den})`
        : `${left.num} - ${right.num} * (${left.den})`
      return { num: newNum, den: left.den }
    }

    // Both have denominators: (lnum*rden op rnum*lden) / (lden*rden)
    const newNum = op === '+'
      ? `(${left.num}) * (${right.den}) + (${right.num}) * (${left.den})`
      : `(${left.num}) * (${right.den}) - (${right.num}) * (${left.den})`
    const newDen = `(${left.den}) * (${right.den})`
    return { num: newNum, den: newDen }
  }
})
