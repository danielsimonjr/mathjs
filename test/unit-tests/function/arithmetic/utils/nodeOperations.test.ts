import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const { SymbolNode, parse } = math

describe('nodeOperations', function () {
  // Create isolated math instance for testing
  const mathInstance = math.create()
  const nodeOps = mathInstance.nodeOperations

  // Helper functions to check node types without instanceof
  // (instanceof doesn't work across module boundaries)
  function isConstantNode(node: any): boolean {
    return node && node.type === 'ConstantNode'
  }

  function isOperatorNode(node: any): boolean {
    return node && node.type === 'OperatorNode'
  }

  describe('wrapInNode', function () {
    it('should wrap a number in ConstantNode', function () {
      const result = nodeOps.wrapInNode(5)
      assert.ok(isConstantNode(result))
      assert.strictEqual((result as any).value, 5)
    })

    it('should wrap zero in ConstantNode', function () {
      const result = nodeOps.wrapInNode(0)
      assert.ok(isConstantNode(result))
      assert.strictEqual((result as any).value, 0)
    })

    it('should wrap negative number in ConstantNode', function () {
      const result = nodeOps.wrapInNode(-10)
      assert.ok(isConstantNode(result))
      assert.strictEqual((result as any).value, -10)
    })

    it('should wrap a string in ConstantNode', function () {
      const result = nodeOps.wrapInNode('hello')
      assert.ok(isConstantNode(result))
      assert.strictEqual((result as any).value, 'hello')
    })

    it('should return ConstantNode unchanged', function () {
      const node = new mathInstance.ConstantNode(42)
      const result = nodeOps.wrapInNode(node)
      assert.strictEqual(result, node)
    })

    it('should return SymbolNode unchanged', function () {
      const node = new SymbolNode('x')
      const result = nodeOps.wrapInNode(node)
      assert.strictEqual(result, node)
    })

    it('should return OperatorNode unchanged', function () {
      const node = new mathInstance.OperatorNode('+', 'add', [
        new mathInstance.ConstantNode(1),
        new mathInstance.ConstantNode(2)
      ])
      const result = nodeOps.wrapInNode(node)
      assert.strictEqual(result, node)
    })

    it('should return parsed expression unchanged', function () {
      const node = parse('x + 1')
      const result = nodeOps.wrapInNode(node)
      assert.strictEqual(result, node)
    })

    it('should wrap BigNumber in ConstantNode', function () {
      const big = math.bignumber(123)
      const result = nodeOps.wrapInNode(big)
      assert.ok(isConstantNode(result))
    })

    it('should wrap Complex in ConstantNode', function () {
      const complex = math.complex(2, 3)
      const result = nodeOps.wrapInNode(complex)
      assert.ok(isConstantNode(result))
    })

    it('should wrap Fraction in ConstantNode', function () {
      const frac = math.fraction(1, 2)
      const result = nodeOps.wrapInNode(frac)
      assert.ok(isConstantNode(result))
    })
  })

  describe('createBinaryNode', function () {
    it('should create OperatorNode from two numbers', function () {
      const result = nodeOps.createBinaryNode('+', 'add', 5, 3)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '+')
      assert.strictEqual((result as any).fn, 'add')
      assert.strictEqual((result as any).args.length, 2)
    })

    it('should create OperatorNode for subtraction', function () {
      const result = nodeOps.createBinaryNode('-', 'subtract', 10, 4)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '-')
      assert.strictEqual((result as any).fn, 'subtract')
    })

    it('should create OperatorNode for multiplication', function () {
      const result = nodeOps.createBinaryNode('*', 'multiply', 3, 7)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '*')
      assert.strictEqual((result as any).fn, 'multiply')
    })

    it('should create OperatorNode for division', function () {
      const result = nodeOps.createBinaryNode('/', 'divide', 12, 4)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '/')
      assert.strictEqual((result as any).fn, 'divide')
    })

    it('should create OperatorNode from number and SymbolNode', function () {
      const xNode = new SymbolNode('x')
      const result = nodeOps.createBinaryNode('+', 'add', 5, xNode)
      assert.ok(isOperatorNode(result))
      assert.ok(isConstantNode((result as any).args[0]))
      assert.strictEqual((result as any).args[1], xNode)
    })

    it('should create OperatorNode from SymbolNode and number', function () {
      const xNode = new SymbolNode('x')
      const result = nodeOps.createBinaryNode('+', 'add', xNode, 5)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).args[0], xNode)
      assert.ok(isConstantNode((result as any).args[1]))
    })

    it('should create OperatorNode from two SymbolNodes', function () {
      const xNode = new SymbolNode('x')
      const yNode = new SymbolNode('y')
      const result = nodeOps.createBinaryNode('+', 'add', xNode, yNode)
      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).args[0], xNode)
      assert.strictEqual((result as any).args[1], yNode)
    })

    it('should handle nested expressions', function () {
      const expr = parse('x + 1')
      const result = nodeOps.createBinaryNode('*', 'multiply', 2, expr)
      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '2 * (x + 1)')
    })

    it('should produce evaluable result', function () {
      const result = nodeOps.createBinaryNode('+', 'add', 5, 3)
      const value = (result as any).compile().evaluate()
      assert.strictEqual(value, 8)
    })

    it('should produce evaluable result with variables', function () {
      const xNode = new SymbolNode('x')
      const result = nodeOps.createBinaryNode('+', 'add', 5, xNode)
      const value = (result as any).compile().evaluate({ x: 10 })
      assert.strictEqual(value, 15)
    })
  })

  describe('createNaryNode', function () {
    it('should create nested OperatorNodes for 3 arguments', function () {
      const result = nodeOps.createNaryNode('+', 'add', [1, 2, 3])
      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '1 + 2 + 3')
    })

    it('should create nested OperatorNodes for 4 arguments', function () {
      const result = nodeOps.createNaryNode('+', 'add', [1, 2, 3, 4])
      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '1 + 2 + 3 + 4')
    })

    it('should create nested multiplication', function () {
      const result = nodeOps.createNaryNode('*', 'multiply', [2, 3, 4])
      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '2 * 3 * 4')
    })

    it('should handle mixed numbers and symbols', function () {
      const x = new SymbolNode('x')
      const result = nodeOps.createNaryNode('+', 'add', [1, x, 3])
      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '1 + x + 3')
    })

    it('should throw for less than 2 arguments', function () {
      assert.throws(
        () => nodeOps.createNaryNode('+', 'add', [1]),
        /requires at least 2 arguments/
      )
    })

    it('should throw for empty array', function () {
      assert.throws(
        () => nodeOps.createNaryNode('+', 'add', []),
        /requires at least 2 arguments/
      )
    })

    it('should produce correct evaluation for 3 arguments', function () {
      const result = nodeOps.createNaryNode('+', 'add', [1, 2, 3])
      const value = (result as any).compile().evaluate()
      assert.strictEqual(value, 6)
    })

    it('should be left-associative', function () {
      // ((1 - 2) - 3) = -4
      const result = nodeOps.createNaryNode('-', 'subtract', [1, 2, 3])
      const value = (result as any).compile().evaluate()
      assert.strictEqual(value, -4)
    })
  })

  describe('hasNodeArg', function () {
    it('should return true if first argument is a Node', function () {
      const x = new SymbolNode('x')
      assert.strictEqual(nodeOps.hasNodeArg(x, 2, 3), true)
    })

    it('should return true if middle argument is a Node', function () {
      const x = new SymbolNode('x')
      assert.strictEqual(nodeOps.hasNodeArg(1, x, 3), true)
    })

    it('should return true if last argument is a Node', function () {
      const x = new SymbolNode('x')
      assert.strictEqual(nodeOps.hasNodeArg(1, 2, x), true)
    })

    it('should return true if all arguments are Nodes', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      assert.strictEqual(nodeOps.hasNodeArg(x, y), true)
    })

    it('should return false if no arguments are Nodes', function () {
      assert.strictEqual(nodeOps.hasNodeArg(1, 2, 3), false)
    })

    it('should return false for empty arguments', function () {
      assert.strictEqual(nodeOps.hasNodeArg(), false)
    })

    it('should detect OperatorNode', function () {
      const node = new mathInstance.OperatorNode('+', 'add', [
        new mathInstance.ConstantNode(1),
        new mathInstance.ConstantNode(2)
      ])
      assert.strictEqual(nodeOps.hasNodeArg(5, node), true)
    })

    it('should detect ConstantNode', function () {
      const node = new mathInstance.ConstantNode(42)
      assert.strictEqual(nodeOps.hasNodeArg(5, node), true)
    })
  })

  describe('getOperator', function () {
    it('should return + for add', function () {
      assert.strictEqual(nodeOps.getOperator('add'), '+')
    })

    it('should return - for subtract', function () {
      assert.strictEqual(nodeOps.getOperator('subtract'), '-')
    })

    it('should return * for multiply', function () {
      assert.strictEqual(nodeOps.getOperator('multiply'), '*')
    })

    it('should return / for divide', function () {
      assert.strictEqual(nodeOps.getOperator('divide'), '/')
    })

    it('should return ^ for pow', function () {
      assert.strictEqual(nodeOps.getOperator('pow'), '^')
    })

    it('should return % for mod', function () {
      assert.strictEqual(nodeOps.getOperator('mod'), '%')
    })

    it('should return function name for unknown operator', function () {
      assert.strictEqual(nodeOps.getOperator('unknown'), 'unknown')
    })
  })

  describe('OPERATOR_MAP', function () {
    it('should contain all arithmetic operators', function () {
      assert.strictEqual(nodeOps.OPERATOR_MAP.add, '+')
      assert.strictEqual(nodeOps.OPERATOR_MAP.subtract, '-')
      assert.strictEqual(nodeOps.OPERATOR_MAP.multiply, '*')
      assert.strictEqual(nodeOps.OPERATOR_MAP.divide, '/')
      assert.strictEqual(nodeOps.OPERATOR_MAP.pow, '^')
      assert.strictEqual(nodeOps.OPERATOR_MAP.mod, '%')
    })
  })
})
