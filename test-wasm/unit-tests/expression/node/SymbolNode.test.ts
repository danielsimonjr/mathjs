<<<<<<< HEAD
// @ts-nocheck
// test SymbolNode
=======
/**
 * Test for SymbolNode - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const OperatorNode = math.OperatorNode

<<<<<<< HEAD
describe('SymbolNode', function () {
  it('should create a SymbolNode', function () {
=======
describe('SymbolNode', function (): void {
  it('should create a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new SymbolNode('sqrt')
    assert(n instanceof SymbolNode)
    assert(n instanceof Node)
    assert.strictEqual(n.type, 'SymbolNode')
  })

<<<<<<< HEAD
  it('should have isSymbolNode', function () {
=======
  it('should have isSymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new SymbolNode('a')
    assert(node.isSymbolNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when calling without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      SymbolNode('sqrt')
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error when calling with wrong arguments', function () {
    assert.throws(function () {
      console.log(new SymbolNode())
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when calling with wrong arguments', function (): void {
    assert.throws(function (): void {
      console.log(new SymbolNode())
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new SymbolNode(2))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error when evaluating an undefined symbol', function () {
    const scope = {}
    const s = new SymbolNode('foo')
    assert.throws(function () {
=======
  it('should throw an error when evaluating an undefined symbol', function (): void {
    const scope = {}
    const s = new SymbolNode('foo')
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      s.compile().evaluate(scope)
    }, /Error: Undefined symbol foo/)
  })

<<<<<<< HEAD
  it('should compile a SymbolNode', function () {
=======
  it('should compile a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const s = new SymbolNode('a')

    const expr = s.compile()
    const scope = { a: 5 }
    assert.strictEqual(expr.evaluate(scope), 5)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      expr.evaluate({})
    }, Error)

    const s2 = new SymbolNode('sqrt')
    const expr2 = s2.compile()
    const scope2 = {}

    assert.strictEqual(expr2.evaluate(scope2), math.sqrt)
  })

<<<<<<< HEAD
  it('should filter a SymbolNode', function () {
=======
  it('should filter a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new SymbolNode('x')
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof SymbolNode
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node.name === 'x'
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node.name === 'q'
      }),
      []
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should run forEach on a SymbolNode', function () {
=======
  it('should run forEach on a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('a')
    a.forEach(function () {
      assert.ok(false, 'should not execute, symbol has no childs')
    })
  })

<<<<<<< HEAD
  it('should map a SymbolNode', function () {
=======
  it('should map a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('a')
    const b = a.map(function () {
      assert.ok(false, 'should not execute, symbol has no childs')
      return undefined
    })

    assert.notStrictEqual(b, a)
    assert.deepStrictEqual(b, a)
  })

<<<<<<< HEAD
  it('should transform a SymbolNode', function () {
=======
  it('should transform a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('x')
    const b = new SymbolNode('y')
    const c = a.transform(function (node) {
      return node instanceof SymbolNode && node.name === 'x' ? b : node
    })
    assert.deepStrictEqual(c, b)

    // no match should leave the symbol as is
    const d = a.transform(function (node) {
      return node instanceof SymbolNode && node.name === 'q' ? b : node
    })
    assert.deepStrictEqual(d, a)
  })

<<<<<<< HEAD
  it('should clone a SymbolNode', function () {
=======
  it('should clone a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('x')
    const b = a.clone()

    assert(b instanceof SymbolNode)
    assert.deepStrictEqual(a, b)
    assert.notStrictEqual(a, b)
    assert.strictEqual(a.name, b.name)
  })

<<<<<<< HEAD
  it('test equality another Node', function () {
=======
  it('test equality another Node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('a')
    const b = new SymbolNode('b')
    const aEqual = new SymbolNode('a')
    const aFake = {
      name: 'a'
    }

    assert.strictEqual(a.equals(null), false)
    assert.strictEqual(a.equals(undefined), false)
    assert.strictEqual(a.equals(aEqual), true)
    assert.strictEqual(a.equals(b), false)
    assert.strictEqual(a.equals(aFake), false)
    assert.strictEqual(a.equals(new ConstantNode(2)), false)
  })

<<<<<<< HEAD
  it('should stringify a SymbolNode', function () {
=======
  it('should stringify a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const s = new SymbolNode('foo')

    assert.strictEqual(s.toString(), 'foo')
  })

<<<<<<< HEAD
  it('should stringify a SymbolNode with custom toString', function () {
=======
  it('should stringify a SymbolNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, _options) {
      if (node.type === 'SymbolNode') {
        return 'symbol(' + node.name + ')'
      }
    }

    const n = new SymbolNode('a')

    assert.strictEqual(n.toString({ handler: customFunction }), 'symbol(a)')
  })

<<<<<<< HEAD
  it('should stringify a SymbolNode with custom toHTML', function () {
=======
  it('should stringify a SymbolNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, _options) {
      if (node.type === 'SymbolNode') {
        return 'symbol(' + node.name + ')'
      }
    }

    const n = new SymbolNode('a')

    assert.strictEqual(n.toHTML({ handler: customFunction }), 'symbol(a)')
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('a')

    const json = a.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'SymbolNode',
      name: 'a'
    })

    const parsed = SymbolNode.fromJSON(json)
    assert.deepStrictEqual(parsed, a)
  })

<<<<<<< HEAD
  it('should LaTeX a SymbolNode', function () {
=======
  it('should LaTeX a SymbolNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(new SymbolNode('foo').toTex(), ' foo')
    assert.strictEqual(new SymbolNode('Infinity').toTex(), '\\infty')
  })

<<<<<<< HEAD
  it('should LaTeX a SymbolNode with custom toTex', function () {
=======
  it('should LaTeX a SymbolNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, _options) {
      if (node.type === 'SymbolNode') {
        return 'symbol(' + node.name + ')'
      }
    }

    const n = new SymbolNode('a')

    assert.strictEqual(n.toTex({ handler: customFunction }), 'symbol(a)')
  })

<<<<<<< HEAD
  it('should LaTeX a SymbolNode without breaking \\cdot', function () {
=======
  it('should LaTeX a SymbolNode without breaking \\cdot', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new SymbolNode('Epsilon')

    const mult = new OperatorNode('*', 'multiply', [a, b])

    assert.strictEqual(mult.toTex(), '1\\cdot E')
  })
})
