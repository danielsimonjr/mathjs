/**
 * Verification tests for nodeTestHelpers module.
 * Ensures test infrastructure is working correctly before Phase 2.
 */
import assert from 'assert'
import {
  testData,
  nodeAssert,
  generateTestMatrix,
  createTestScope,
  math
} from './nodeTestHelpers.ts'

const { ConstantNode, SymbolNode, OperatorNode } = math

describe('nodeTestHelpers', function () {
  describe('testData', function () {
    it('should provide numbers array', function () {
      assert.ok(Array.isArray(testData.numbers))
      assert.ok(testData.numbers.length > 0)
      assert.ok(testData.numbers.every((n) => typeof n === 'number'))
    })

    it('should provide bigNumbers generator', function () {
      const bigs = testData.bigNumbers()
      assert.ok(Array.isArray(bigs))
      assert.ok(bigs.length > 0)
      assert.ok(bigs.every((b) => math.isBigNumber(b)))
    })

    it('should provide complexNumbers generator', function () {
      const complexes = testData.complexNumbers()
      assert.ok(Array.isArray(complexes))
      assert.ok(complexes.length > 0)
      assert.ok(complexes.every((c) => math.isComplex(c)))
    })

    it('should provide fractions generator', function () {
      const fracs = testData.fractions()
      assert.ok(Array.isArray(fracs))
      assert.ok(fracs.length > 0)
      assert.ok(fracs.every((f) => math.isFraction(f)))
    })

    it('should provide simpleNodes generator', function () {
      const nodes = testData.simpleNodes()
      assert.ok(Array.isArray(nodes))
      assert.ok(nodes.length > 0)
      assert.ok(nodes.every((n) => (n as any).isNode === true))
    })

    it('should provide evaluableNodes generator', function () {
      const evalNodes = testData.evaluableNodes()
      assert.ok(Array.isArray(evalNodes))
      assert.ok(evalNodes.length > 0)
      evalNodes.forEach(({ node, scope, expected }) => {
        assert.ok((node as any).isNode === true)
        assert.ok(typeof scope === 'object')
        assert.ok(typeof expected === 'number')
      })
    })
  })

  describe('nodeAssert', function () {
    describe('isOperatorNode', function () {
      it('should pass for valid OperatorNode', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(1),
          new ConstantNode(2)
        ])
        // Should not throw
        nodeAssert.isOperatorNode(node, '+', 'add')
      })

      it('should throw for non-OperatorNode', function () {
        const node = new ConstantNode(5)
        assert.throws(() => {
          nodeAssert.isOperatorNode(node, '+', 'add')
        })
      })

      it('should throw for wrong operator', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(1),
          new ConstantNode(2)
        ])
        assert.throws(() => {
          nodeAssert.isOperatorNode(node, '-', 'add')
        })
      })

      it('should throw for wrong function name', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(1),
          new ConstantNode(2)
        ])
        assert.throws(() => {
          nodeAssert.isOperatorNode(node, '+', 'subtract')
        })
      })
    })

    describe('hasArgs', function () {
      it('should pass for correct arg count', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(1),
          new ConstantNode(2)
        ])
        nodeAssert.hasArgs(node, 2)
      })

      it('should throw for wrong arg count', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(1),
          new ConstantNode(2)
        ])
        assert.throws(() => {
          nodeAssert.hasArgs(node, 3)
        })
      })
    })

    describe('evaluatesTo', function () {
      it('should pass for correct evaluation', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(2),
          new ConstantNode(3)
        ])
        nodeAssert.evaluatesTo(node, 5)
      })

      it('should pass for correct evaluation with scope', function () {
        const node = new OperatorNode('+', 'add', [
          new SymbolNode('x'),
          new ConstantNode(3)
        ])
        nodeAssert.evaluatesTo(node, 13, { x: 10 })
      })

      it('should throw for wrong evaluation', function () {
        const node = new OperatorNode('+', 'add', [
          new ConstantNode(2),
          new ConstantNode(3)
        ])
        assert.throws(() => {
          nodeAssert.evaluatesTo(node, 10)
        })
      })
    })

    describe('toStringEquals', function () {
      it('should pass for correct string', function () {
        const node = new OperatorNode('+', 'add', [
          new SymbolNode('x'),
          new ConstantNode(5)
        ])
        nodeAssert.toStringEquals(node, 'x + 5')
      })

      it('should throw for wrong string', function () {
        const node = new OperatorNode('+', 'add', [
          new SymbolNode('x'),
          new ConstantNode(5)
        ])
        assert.throws(() => {
          nodeAssert.toStringEquals(node, 'y + 5')
        })
      })
    })

    describe('isNumeric', function () {
      it('should pass for number', function () {
        nodeAssert.isNumeric(5)
      })

      it('should pass for BigNumber', function () {
        nodeAssert.isNumeric(math.bignumber(5))
      })

      it('should pass for Complex', function () {
        nodeAssert.isNumeric(math.complex(2, 3))
      })

      it('should pass for Fraction', function () {
        nodeAssert.isNumeric(math.fraction(1, 2))
      })

      it('should throw for Node', function () {
        assert.throws(() => {
          nodeAssert.isNumeric(new SymbolNode('x'))
        })
      })
    })
  })

  describe('generateTestMatrix', function () {
    it('should generate test cases', function () {
      const matrix = generateTestMatrix('+', 'add')
      assert.ok(Array.isArray(matrix))
      assert.ok(matrix.length > 0)
    })

    it('should generate cases with left, right, and desc', function () {
      const matrix = generateTestMatrix('+', 'add')
      matrix.forEach(({ left, right, desc }) => {
        assert.ok(left !== undefined)
        assert.ok(right !== undefined)
        assert.ok(typeof desc === 'string')
      })
    })

    it('should include number + Node combinations', function () {
      const matrix = generateTestMatrix('+', 'add')
      const numNodeCases = matrix.filter(
        ({ left, right }) => typeof left === 'number' && (right as any)?.isNode
      )
      assert.ok(numNodeCases.length > 0)
    })

    it('should include Node + number combinations', function () {
      const matrix = generateTestMatrix('+', 'add')
      const nodeNumCases = matrix.filter(
        ({ left, right }) => (left as any)?.isNode && typeof right === 'number'
      )
      assert.ok(nodeNumCases.length > 0)
    })

    it('should include Node + Node combinations', function () {
      const matrix = generateTestMatrix('+', 'add')
      const nodeNodeCases = matrix.filter(
        ({ left, right }) => (left as any)?.isNode && (right as any)?.isNode
      )
      assert.ok(nodeNodeCases.length > 0)
    })
  })

  describe('createTestScope', function () {
    it('should return object with common variables', function () {
      const scope = createTestScope()
      assert.ok(typeof scope === 'object')
      assert.ok('x' in scope)
      assert.ok('y' in scope)
      assert.ok(typeof scope.x === 'number')
      assert.ok(typeof scope.y === 'number')
    })
  })
})
