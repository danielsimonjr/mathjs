import { factory } from '../../utils/factory.js'

const name = 'integrate'
const dependencies = [
  'typed',
  'parse',
  'simplify',
  'ConstantNode',
  'OperatorNode',
  'SymbolNode',
  'FunctionNode'
]

export const createIntegrate = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify,
  ConstantNode,
  OperatorNode,
  SymbolNode,
  FunctionNode
}) => {
  /**
   * Compute the symbolic integral of an expression with respect to a variable.
   * Handles polynomials (power rule), basic trig (sin, cos), exponentials (exp),
   * and logarithms (1/x to ln(x)). Uses linearity of integration for sums and
   * constant multiples.
   *
   * Syntax:
   *
   *     math.integrate(expr, variable)
   *
   * Examples:
   *
   *     math.integrate('x^2', 'x')
   *     math.integrate('sin(x)', 'x')
   *     math.integrate('exp(x)', 'x')
   *
   * See also:
   *
   *     derivative, simplify
   *
   * @param {Node | string} expr       The expression to integrate
   * @param {string} variable          The variable of integration
   * @return {string}                  The integral (without +C)
   */
  function integrateExpr (expr, variable) {
    const node = typeof expr === 'string' ? parse(expr) : expr
    const varName = typeof variable === 'string' ? variable : variable.name
    const result = _integrate(node, varName)
    return simplify(result).toString()
  }

  function _integrate (node, varName) {
    if (node.isConstantNode) {
      return new OperatorNode('*', 'multiply', [
        node.clone(),
        new SymbolNode(varName)
      ])
    }

    if (node.isSymbolNode) {
      if (node.name !== varName) {
        return new OperatorNode('*', 'multiply', [
          node.clone(),
          new SymbolNode(varName)
        ])
      }
      return new OperatorNode('/', 'divide', [
        new OperatorNode('^', 'pow', [
          new SymbolNode(varName),
          new ConstantNode(2)
        ]),
        new ConstantNode(2)
      ])
    }

    if (node.isFunctionNode) {
      return _integrateFunctionNode(node, varName)
    }

    if (node.isOperatorNode) {
      return _integrateOperatorNode(node, varName)
    }

    if (node.isParenthesisNode) {
      return _integrate(node.content, varName)
    }

    throw new Error('integrate: unsupported node type: ' + node.type)
  }

  function _integrateFunctionNode (node, varName) {
    const arg0 = node.args[0]
    const isDirectVar = arg0.isSymbolNode && arg0.name === varName

    switch (node.name) {
      case 'sin':
        if (isDirectVar) {
          return new OperatorNode('-', 'unaryMinus', [
            new FunctionNode('cos', [arg0.clone()])
          ])
        }
        break
      case 'cos':
        if (isDirectVar) {
          return new FunctionNode('sin', [arg0.clone()])
        }
        break
      case 'exp':
        if (isDirectVar) {
          return new FunctionNode('exp', [arg0.clone()])
        }
        break
      case 'log':
        if (isDirectVar && node.args.length === 1) {
          return new OperatorNode('-', 'subtract', [
            new OperatorNode('*', 'multiply', [
              new SymbolNode(varName),
              new FunctionNode('log', [arg0.clone()])
            ]),
            new SymbolNode(varName)
          ])
        }
        break
      default:
        break
    }

    if (!_containsVar(node, varName)) {
      return new OperatorNode('*', 'multiply', [
        node.clone(),
        new SymbolNode(varName)
      ])
    }

    throw new Error('integrate: unsupported function "' + node.name + '" with argument "' + arg0.toString() + '"')
  }

  function _integrateOperatorNode (node, varName) {
    if (node.isUnary() && node.op === '-') {
      return new OperatorNode('-', 'unaryMinus', [
        _integrate(node.args[0], varName)
      ])
    }

    if (node.op === '+' || node.op === '-') {
      return new OperatorNode(node.op, node.fn, node.args.map(function (arg) {
        return _integrate(arg, varName)
      }))
    }

    if (node.op === '*' && node.isBinary()) {
      const left = node.args[0]
      const right = node.args[1]
      const leftConst = !_containsVar(left, varName)
      const rightConst = !_containsVar(right, varName)

      if (leftConst && !rightConst) {
        return new OperatorNode('*', 'multiply', [
          left.clone(),
          _integrate(right, varName)
        ])
      }
      if (rightConst && !leftConst) {
        return new OperatorNode('*', 'multiply', [
          right.clone(),
          _integrate(left, varName)
        ])
      }
      if (leftConst && rightConst) {
        return new OperatorNode('*', 'multiply', [
          node.clone(),
          new SymbolNode(varName)
        ])
      }
    }

    if (node.op === '/' && node.isBinary()) {
      const num = node.args[0]
      const den = node.args[1]
      const denConst = !_containsVar(den, varName)

      if (denConst) {
        return new OperatorNode('/', 'divide', [
          _integrate(num, varName),
          den.clone()
        ])
      }

      const numIsOne = num.isConstantNode && num.value === 1
      const denIsVar = den.isSymbolNode && den.name === varName

      if (numIsOne && denIsVar) {
        return new FunctionNode('log', [new SymbolNode(varName)])
      }

      if (!_containsVar(num, varName) && denIsVar) {
        return new OperatorNode('*', 'multiply', [
          num.clone(),
          new FunctionNode('log', [new SymbolNode(varName)])
        ])
      }
    }

    if (node.op === '^' && node.isBinary()) {
      const base = node.args[0]
      const exp = node.args[1]
      const baseIsVar = base.isSymbolNode && base.name === varName
      const expIsConst = !_containsVar(exp, varName)

      if (baseIsVar && expIsConst) {
        const newExp = new OperatorNode('+', 'add', [
          exp.clone(),
          new ConstantNode(1)
        ])
        return new OperatorNode('/', 'divide', [
          new OperatorNode('^', 'pow', [
            new SymbolNode(varName),
            newExp
          ]),
          newExp.clone()
        ])
      }
    }

    if (!_containsVar(node, varName)) {
      return new OperatorNode('*', 'multiply', [
        node.clone(),
        new SymbolNode(varName)
      ])
    }

    throw new Error('integrate: unsupported operator "' + node.op + '" in expression "' + node.toString() + '"')
  }

  function _containsVar (node, varName) {
    if (node.isSymbolNode) return node.name === varName
    if (node.isConstantNode) return false
    if (node.isFunctionNode) return node.args.some(function (a) { return _containsVar(a, varName) })
    if (node.isOperatorNode) return node.args.some(function (a) { return _containsVar(a, varName) })
    if (node.isParenthesisNode) return _containsVar(node.content, varName)
    return false
  }

  return typed(name, {
    'Node, string': function (expr, variable) { return integrateExpr(expr, variable) },
    'string, string': function (expr, variable) { return integrateExpr(parse(expr), variable) }
  })
})
