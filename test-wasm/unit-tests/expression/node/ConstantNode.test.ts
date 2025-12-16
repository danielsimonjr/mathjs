<<<<<<< HEAD
// @ts-nocheck
// test ConstantNode
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for ConstantNode - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode { type: string; toTex(): string }
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const bigmath = math.create({ number: 'BigNumber' })
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode

<<<<<<< HEAD
describe('ConstantNode', function () {
  it('should create a ConstantNode', function () {
=======
describe('ConstantNode', function (): void {
  it('should create a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(3)
    assert(a instanceof Node)
    assert.strictEqual(a.type, 'ConstantNode')
    // TODO: extensively test each of the supported types

    assert.strictEqual(new ConstantNode(3).value, 3)
    assert.strictEqual(new ConstantNode(3n).value, 3n)
    assert.strictEqual(new ConstantNode('hello').value, 'hello')
    assert.strictEqual(new ConstantNode(true).value, true)
    assert.strictEqual(new ConstantNode(false).value, false)
    assert.strictEqual(new ConstantNode(null).value, null)
    assert.strictEqual(new ConstantNode(undefined).value, undefined)
  })

<<<<<<< HEAD
  it('should have isConstantNode', function () {
=======
  it('should have isConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new ConstantNode(1)
    assert(node.isConstantNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when calling without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      ConstantNode(3)
    }, TypeError)
  })

<<<<<<< HEAD
  it('should compile a ConstantNode', function () {
=======
  it('should compile a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    let expr = new ConstantNode(2.3).compile()
    assert.strictEqual(expr.evaluate(), 2.3)

    expr = new ConstantNode(2.3).compile()
    assert.strictEqual(expr.evaluate(), 2.3)

    expr = new ConstantNode(4n).compile()
    assert.strictEqual(expr.evaluate(), 4n)

    expr = new ConstantNode('hello').compile()
    assert.strictEqual(expr.evaluate(), 'hello')

    expr = new ConstantNode(true).compile()
    assert.strictEqual(expr.evaluate(), true)

    expr = new ConstantNode(undefined).compile()
    assert.strictEqual(expr.evaluate(), undefined)

    expr = new ConstantNode(null).compile()
    assert.strictEqual(expr.evaluate(), null)
  })

<<<<<<< HEAD
  it('should compile a ConstantNode with bigmath', function () {
=======
  it('should compile a ConstantNode with bigmath', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const constantNode = bigmath.parse('2.3')
    assert.ok(constantNode.isConstantNode)
    const expr = constantNode.compile()
    assert.deepStrictEqual(expr.evaluate(), new bigmath.BigNumber(2.3))
  })

<<<<<<< HEAD
  it('should find a ConstantNode', function () {
=======
  it('should find a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    assert.deepStrictEqual(
      a.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [a]
    )
    assert.deepStrictEqual(
      a.filter(function (node) {
        return node instanceof SymbolNode
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should leave quotes in strings as is (no escaping)', function () {
=======
  it('should leave quotes in strings as is (no escaping)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      new ConstantNode('"+foo+"').compile().evaluate(),
      '"+foo+"'
    )
    assert.strictEqual(
      new ConstantNode('\\"escaped\\"').compile().evaluate(),
      '\\"escaped\\"'
    )
  })

<<<<<<< HEAD
  it('should find a ConstantNode', function () {
=======
  it('should find a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    assert.deepStrictEqual(
      a.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [a]
    )
    assert.deepStrictEqual(
      a.filter(function (node) {
        return node instanceof SymbolNode
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should run forEach on a ConstantNode', function () {
=======
  it('should run forEach on a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    a.forEach(function () {
      assert.ok(false, 'should not execute, constant has no childs')
    })
  })

<<<<<<< HEAD
  it('should map a ConstantNode', function () {
=======
  it('should map a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const b = a.map(function () {
      assert.ok(false, 'should not execute, constant has no childs')
      return undefined
    })

    assert.notStrictEqual(b, a)
    assert.deepStrictEqual(b, a)
  })

<<<<<<< HEAD
  it('should transform a ConstantNode', function () {
=======
  it('should transform a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const c = a.transform(function (node) {
      return node instanceof ConstantNode && node.value === 2 ? b : node
    })
    assert.deepStrictEqual(c, b)

    // no match should leave the node as is
    const d = a.transform(function (node) {
      return node instanceof ConstantNode && node.value === 99 ? b : node
    })
    assert.notStrictEqual(d, a)
    assert.deepStrictEqual(d, a)
  })

<<<<<<< HEAD
  it('should clone a ConstantNode', function () {
=======
  it('should clone a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)
    const b = a.clone()

    assert(b instanceof ConstantNode)
    assert.deepStrictEqual(a, b)
    assert.notStrictEqual(a, b)
    assert.strictEqual(a.value, b.value)
    assert.strictEqual(a.valueType, b.valueType)
  })

<<<<<<< HEAD
  it('test equality another Node', function () {
=======
  it('test equality another Node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2)

    assert.strictEqual(a.equals(null), false)
    assert.strictEqual(a.equals(undefined), false)
    assert.strictEqual(a.equals(new ConstantNode(2)), true)
    assert.strictEqual(a.equals(new ConstantNode(3)), false)
    assert.strictEqual(a.equals(new ConstantNode('2')), false)
    assert.strictEqual(a.equals(new SymbolNode('2')), false)
    assert.strictEqual(a.equals({ value: 2 }), false)
  })

<<<<<<< HEAD
  it('should stringify a ConstantNode', function () {
=======
  it('should stringify a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(new ConstantNode(3).toString(), '3')
    assert.deepStrictEqual(new ConstantNode(3).toString(), '3')
    assert.deepStrictEqual(new ConstantNode(3n).toString(), '3')
    assert.deepStrictEqual(
      new ConstantNode(math.bignumber('1e500')).toString(),
      '1e+500'
    )
    assert.deepStrictEqual(
      new ConstantNode(math.fraction(2, 3)).toString(),
      '2/3'
    )
    assert.strictEqual(new ConstantNode('hi').toString(), '"hi"')
    assert.strictEqual(
      new ConstantNode('with " double quote').toString(),
      '"with \\" double quote"'
    )
    assert.strictEqual(new ConstantNode(true).toString(), 'true')
    assert.strictEqual(new ConstantNode(false).toString(), 'false')
    assert.strictEqual(new ConstantNode(undefined).toString(), 'undefined')
    assert.strictEqual(new ConstantNode(null).toString(), 'null')
  })

<<<<<<< HEAD
  it('should stringify a ConstantNode with custom toString', function () {
=======
  it('should stringify a ConstantNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node) {
      if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ')'
      }
    }

    const n = new ConstantNode(1)

    assert.strictEqual(n.toString({ handler: customFunction }), 'const(1)')
  })

<<<<<<< HEAD
  it('should stringify a ConstantNode with custom toHTML', function () {
=======
  it('should stringify a ConstantNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node) {
      if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ')'
      }
    }

    const n = new ConstantNode(1)

    assert.strictEqual(n.toHTML({ handler: customFunction }), 'const(1)')
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(2.3)

    const json = a.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'ConstantNode',
      value: 2.3
    })

    const parsed = ConstantNode.fromJSON(json)
    assert.deepStrictEqual(parsed, a)
  })

<<<<<<< HEAD
  it('should LaTeX a ConstantNode', function () {
=======
  it('should LaTeX a ConstantNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(new ConstantNode(3).toTex(), '3')
    assert.deepStrictEqual(new ConstantNode(3).toTex(), '3')
    assert.deepStrictEqual(new ConstantNode(42n).toTex(), '42')
    assert.deepStrictEqual(new ConstantNode(math.bignumber('3')).toTex(), '3')
    assert.deepStrictEqual(
      new ConstantNode(math.bignumber('1.3e7')).toTex(),
      '1.3\\cdot10^{+7}'
    )
    assert.deepStrictEqual(
      new ConstantNode(math.bignumber('1e500')).toTex(),
      '1\\cdot10^{+500}'
    )
    assert.deepStrictEqual(
      new ConstantNode(math.bignumber('1e-500')).toTex(),
      '1\\cdot10^{-500}'
    )
    assert.deepStrictEqual(
      new ConstantNode(math.bignumber('12345678901234567890')).toTex(),
      '1.234567890123456789\\cdot10^{+19}'
    )
    assert.strictEqual(new ConstantNode('hi').toTex(), '\\mathtt{"hi"}')
    assert.strictEqual(new ConstantNode(true).toTex(), 'true')
    assert.strictEqual(new ConstantNode(false).toTex(), 'false')
    assert.strictEqual(new ConstantNode(undefined).toTex(), 'undefined')
    assert.strictEqual(new ConstantNode(null).toTex(), 'null')
  })

<<<<<<< HEAD
  it('should LaTeX a ConstantNode with value Infinity', function () {
=======
  it('should LaTeX a ConstantNode with value Infinity', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(new ConstantNode(Infinity).toTex(), '\\infty')
    assert.strictEqual(new ConstantNode(-Infinity).toTex(), '-\\infty')
    assert.strictEqual(
      new ConstantNode(math.bignumber('Infinity')).toTex(),
      '\\infty'
    )
    assert.strictEqual(
      new ConstantNode(math.bignumber('-Infinity')).toTex(),
      '-\\infty'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a ConstantNode in exponential notation', function () {
=======
  it('should LaTeX a ConstantNode in exponential notation', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConstantNode(1e10)
    assert.strictEqual(n.toTex(), '1\\cdot10^{+10}')
  })

<<<<<<< HEAD
  it('should LaTeX a ConstantNode with custom toTex', function () {
=======
  it('should LaTeX a ConstantNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, _options) {
      if (node.type === 'ConstantNode') {
        return 'const\\left(' + node.value + '\\right)'
      }
    }

    const n = new ConstantNode(1)

    assert.strictEqual(
      n.toTex({ handler: customFunction }),
      'const\\left(1\\right)'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a ConstantNode with a fraction', function () {
=======
  it('should LaTeX a ConstantNode with a fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const positive = new ConstantNode(new math.Fraction(1.5))
    const negative = new ConstantNode(new math.Fraction(-1.5))

    assert.strictEqual(positive.toTex(), '\\frac{3}{2}')
    assert.strictEqual(negative.toTex(), '-\\frac{3}{2}')
  })

<<<<<<< HEAD
  it('should escape strings in toTex', function () {
=======
  it('should escape strings in toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConstantNode('space tab\tunderscore_bla$/')

    assert.strictEqual(
      n.toTex(),
      '\\mathtt{"space~tab\\textbackslash{}tunderscore\\_bla\\$/"}'
    )
  })
})
