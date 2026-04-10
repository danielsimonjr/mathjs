import { factory } from '../../utils/factory.js'

const name = 'degree'
const dependencies = ['typed', 'parse']

export const createDegree = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse
}) => {
  /**
   * Find the degree of a polynomial expression in a specified variable.
   * Walks the AST to find the highest power of the variable.
   *
   * Syntax:
   *
   *     math.degree(polynomial, variable)
   *
   * Examples:
   *
   *     math.degree('3*x^5 + 2*x^3 + 1', 'x')  // 5
   *     math.degree('x^2 + x + 1', 'x')         // 2
   *     math.degree('7', 'x')                    // 0
   *     math.degree('x', 'x')                    // 1
   *
   * See also:
   *
   *     simplify, parse, derivative
   *
   * @param  {string | Node}  polynomial  The polynomial expression
   * @param  {string}         variable    The variable name
   * @return {number}                     The degree (highest power) of the variable
   */
  return typed(name, {
    'string | Node, string': function (polynomial, variable) {
      const node = typeof polynomial === 'string' ? parse(polynomial) : polynomial
      return _maxDegree(node, variable)
    }
  })

  /**
   * Recursively find the maximum degree of `variable` in the AST node.
   * @param {Node} node
   * @param {string} variable
   * @return {number}
   */
  function _maxDegree (node, variable) {
    if (node.type === 'ConstantNode') {
      return 0
    }

    if (node.type === 'SymbolNode') {
      return node.name === variable ? 1 : 0
    }

    if (node.type === 'ParenthesisNode') {
      return _maxDegree(node.content, variable)
    }

    if (node.type === 'OperatorNode') {
      if (node.op === '+' || node.op === '-') {
        // Degree of sum/difference is max of degrees of terms
        return node.args.reduce(function (maxDeg, arg) {
          return Math.max(maxDeg, _maxDegree(arg, variable))
        }, 0)
      }

      if (node.op === '*') {
        // Degree of product is sum of degrees
        return node.args.reduce(function (sumDeg, arg) {
          return sumDeg + _maxDegree(arg, variable)
        }, 0)
      }

      if (node.op === '^' && node.args.length === 2) {
        const base = node.args[0]
        const exp = node.args[1]

        // Only handle x^n where n is a non-negative integer constant
        if (exp.type === 'ConstantNode') {
          const n = Number(exp.value)
          if (Number.isInteger(n) && n >= 0) {
            const baseDeg = _maxDegree(base, variable)
            return baseDeg * n
          }
        }

        // For non-integer exponents, check if base contains the variable
        const baseDeg = _maxDegree(base, variable)
        if (baseDeg === 0) return 0 // constant base, no contribution

        // Can't determine degree for expressions like x^x
        return -Infinity // Signal that this is not a polynomial
      }

      if (node.op === '/') {
        // For division, only handle division by a constant (no variable in denominator)
        const denDeg = _maxDegree(node.args[1], variable)
        if (denDeg === 0) {
          return _maxDegree(node.args[0], variable)
        }
        return -Infinity // Not a polynomial
      }

      // Unary minus
      if (node.op === '-' && node.args.length === 1) {
        return _maxDegree(node.args[0], variable)
      }
    }

    if (node.type === 'FunctionNode') {
      // If none of the function arguments contain the variable, degree is 0
      const hasVar = node.args.some(function (arg) {
        return _containsVariable(arg, variable)
      })
      if (!hasVar) return 0

      // For functions applied to the variable, we can't determine degree
      return -Infinity
    }

    return 0
  }

  /**
   * Check whether a node contains a reference to the given variable.
   * @param {Node} node
   * @param {string} variable
   * @return {boolean}
   */
  function _containsVariable (node, variable) {
    if (node.type === 'SymbolNode') return node.name === variable
    if (node.args) {
      return node.args.some(function (arg) { return _containsVariable(arg, variable) })
    }
    if (node.content) return _containsVariable(node.content, variable)
    return false
  }
})
