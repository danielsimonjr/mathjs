import { factory } from '../../utils/factory.js'

const name = 'variables'
const dependencies = ['typed', 'parse']

// Known mathematical constants to exclude from variable list
const KNOWN_CONSTANTS = new Set([
  'pi', 'e', 'i', 'Infinity', 'NaN', 'true', 'false',
  'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2', 'SQRT2',
  'tau', 'phi', 'version',
  // math.js built-in constants
  'Catalan', 'EulerMasheroni', 'GoldenRatio', 'SpeedOfLight',
  // commonly excluded math symbols
  'exp', 'log', 'sin', 'cos', 'tan', 'sqrt', 'abs', 'floor', 'ceil',
  'round', 'sign', 'pow', 'mod', 'max', 'min', 'sum', 'prod',
  'null', 'undefined'
])

export const createVariables = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse
}) => {
  /**
   * Extract all symbolic variable names from an expression.
   *
   * Walks the AST and collects all SymbolNode names, excluding known
   * mathematical constants (pi, e, i) and built-in function names.
   * Returns a sorted array of unique variable names.
   *
   * Syntax:
   *
   *     math.variables(expr)
   *
   * Examples:
   *
   *     math.variables("x^2 + y*z + pi")
   *     math.variables("a*sin(b) + c")
   *     math.variables("3*x + 2")
   *
   * See also:
   *
   *     parse, simplify, derivative
   *
   * @param {Node|string} expr   The expression to inspect
   * @return {string[]}          Sorted array of unique variable names
   */
  return typed(name, {
    string: function (expr) {
      return collectVariables(parse(expr))
    },
    Node: function (node) {
      return collectVariables(node)
    }
  })

  function collectVariables (node) {
    const found = new Set()
    walkNode(node, found)
    const result = Array.from(found).filter(v => !KNOWN_CONSTANTS.has(v))
    return result.sort()
  }

  function walkNode (node, found) {
    if (node.isSymbolNode) {
      found.add(node.name)
      return
    }
    if (node.isOperatorNode || node.isParenthesisNode) {
      const args = node.args || (node.content ? [node.content] : [])
      for (const arg of args) walkNode(arg, found)
      return
    }
    if (node.isFunctionNode) {
      // Exclude the function name itself; walk arguments
      for (const arg of node.args) walkNode(arg, found)
      return
    }
    if (node.isAccessorNode) {
      walkNode(node.object, found)
      return
    }
    if (node.isArrayNode) {
      for (const item of node.items) walkNode(item, found)
      return
    }
    if (node.isObjectNode) {
      for (const val of Object.values(node.properties)) walkNode(val, found)
      return
    }
    if (node.isAssignmentNode || node.isFunctionAssignmentNode) {
      if (node.value) walkNode(node.value, found)
      if (node.expr) walkNode(node.expr, found)
      return
    }
    if (node.isBlockNode) {
      for (const block of node.blocks) walkNode(block.node, found)
      return
    }
    if (node.isConditionalNode) {
      walkNode(node.condition, found)
      walkNode(node.trueExpr, found)
      walkNode(node.falseExpr, found)
      return
    }
    // ConstantNode and others: no variables
  }
})
