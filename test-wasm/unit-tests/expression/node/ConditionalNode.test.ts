<<<<<<< HEAD
// @ts-nocheck
// test ConditionalNode
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for ConditionalNode - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode { type: string; toTex(): string }
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const AssignmentNode = math.AssignmentNode
const ConditionalNode = math.ConditionalNode

<<<<<<< HEAD
describe('ConditionalNode', function () {
=======
describe('ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  const condition = new ConstantNode(true)
  const zero = new ConstantNode(0)
  const one = new ConstantNode(1)
  const two = new ConstantNode(2)
  const three = new ConstantNode(3)
  const a = new AssignmentNode(new SymbolNode('a'), two)
  const b = new AssignmentNode(new SymbolNode('b'), three)

<<<<<<< HEAD
  it('should create a ConditionalNode', function () {
=======
  it('should create a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConditionalNode(condition, a, b)
    assert(n instanceof ConditionalNode)
    assert(n instanceof Node)
    assert.strictEqual(n.type, 'ConditionalNode')
  })

<<<<<<< HEAD
  it('should have isConditionalNode', function () {
=======
  it('should have isConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new ConditionalNode(condition, a, b)
    assert(node.isConditionalNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when calling without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      ConditionalNode()
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error when creating without arguments', function () {
    assert.throws(function () {
      console.log(new ConditionalNode())
    }, TypeError)
    assert.throws(function () {
      console.log(new ConditionalNode(condition))
    }, TypeError)
    assert.throws(function () {
      console.log(new ConditionalNode(condition, a))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when creating without arguments', function (): void {
    assert.throws(function (): void {
      console.log(new ConditionalNode())
    }, TypeError)
    assert.throws(function (): void {
      console.log(new ConditionalNode(condition))
    }, TypeError)
    assert.throws(function (): void {
      console.log(new ConditionalNode(condition, a))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new ConditionalNode(condition, null, b))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should lazy evaluate a ConditionalNode', function () {
=======
  it('should lazy evaluate a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConditionalNode(condition, a, b)
    const expr = n.compile()
    const scope = {}
    assert.strictEqual(expr.evaluate(scope), 2)
    assert.deepStrictEqual(scope, { a: 2 })
  })

<<<<<<< HEAD
  describe('evaluate', function () {
    const condition = new ConditionalNode(new SymbolNode('a'), one, zero)

    it('should evaluate boolean conditions', function () {
=======
  describe('evaluate', function (): void {
    const condition = new ConditionalNode(new SymbolNode('a'), one, zero)

    it('should evaluate boolean conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(condition.compile().evaluate({ a: true }), 1)
      assert.strictEqual(condition.compile().evaluate({ a: false }), 0)
    })

<<<<<<< HEAD
    it('should evaluate number conditions', function () {
=======
    it('should evaluate number conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(condition.compile().evaluate({ a: 1 }), 1)
      assert.strictEqual(condition.compile().evaluate({ a: 4 }), 1)
      assert.strictEqual(condition.compile().evaluate({ a: -1 }), 1)
      assert.strictEqual(condition.compile().evaluate({ a: 0 }), 0)
    })

<<<<<<< HEAD
    it('should evaluate bignumber conditions', function () {
=======
    it('should evaluate bignumber conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(
        condition.compile().evaluate({ a: math.bignumber(1) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.bignumber(4) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.bignumber(-1) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.bignumber(0) }),
        0
      )
    })

<<<<<<< HEAD
    it('should evaluate complex number conditions', function () {
=======
    it('should evaluate complex number conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(
        condition.compile().evaluate({ a: math.complex(2, 3) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.complex(2, 0) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.complex(0, 3) }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.complex(0, 0) }),
        0
      )
    })

<<<<<<< HEAD
    it('should evaluate string conditions', function () {
=======
    it('should evaluate string conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(condition.compile().evaluate({ a: 'hello' }), 1)
      assert.strictEqual(condition.compile().evaluate({ a: '' }), 0)
    })

<<<<<<< HEAD
    it('should evaluate unit conditions', function () {
=======
    it('should evaluate unit conditions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.strictEqual(
        condition.compile().evaluate({ a: math.unit('5cm') }),
        1
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.unit('0 inch') }),
        0
      )
      assert.strictEqual(
        condition.compile().evaluate({ a: math.unit('meter') }),
        0
      )
    })

<<<<<<< HEAD
    it('should evaluate null conditions', function () {
      assert.strictEqual(condition.compile().evaluate({ a: null }), 0)
    })

    it('should evaluate undefined conditions', function () {
      assert.strictEqual(condition.compile().evaluate({ a: undefined }), 0)
    })

    it('should throw an error in case of unsupported type of conditions', function () {
      assert.throws(function () {
        condition.compile().evaluate({ a: {} })
      })
      assert.throws(function () {
        condition.compile().evaluate({ a: [] })
      })
      assert.throws(function () {
=======
    it('should evaluate null conditions', function (): void {
      assert.strictEqual(condition.compile().evaluate({ a: null }), 0)
    })

    it('should evaluate undefined conditions', function (): void {
      assert.strictEqual(condition.compile().evaluate({ a: undefined }), 0)
    })

    it('should throw an error in case of unsupported type of conditions', function (): void {
      assert.throws(function (): void {
        condition.compile().evaluate({ a: {} })
      })
      assert.throws(function (): void {
        condition.compile().evaluate({ a: [] })
      })
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        condition.compile().evaluate({ a: math.matrix() })
      })
    })
  })

<<<<<<< HEAD
  it('should filter a ConditionalNode', function () {
=======
  it('should filter a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConditionalNode(condition, a, b)

    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConditionalNode
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [condition, two, three]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode && node.value === 2
      }),
      [two]
    )
  })

<<<<<<< HEAD
  it('should run forEach on a ConditionalNode', function () {
=======
  it('should run forEach on a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const nodes = []
    const paths = []
    n.forEach(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)
    })

    assert.strictEqual(nodes.length, 3)
    assert.strictEqual(nodes[0], condition)
    assert.strictEqual(nodes[1], a)
    assert.strictEqual(nodes[2], b)
    assert.deepStrictEqual(paths, ['condition', 'trueExpr', 'falseExpr'])
  })

<<<<<<< HEAD
  it('should map a ConditionalNode', function () {
=======
  it('should map a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const nodes = []
    const paths = []
    const e = new ConstantNode(4)
    const f = n.map(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)

      return node instanceof ConstantNode && node.value === 1 ? e : node
    })

    assert.strictEqual(nodes.length, 3)
    assert.strictEqual(nodes[0], condition)
    assert.strictEqual(nodes[1], a)
    assert.strictEqual(nodes[2], b)
    assert.deepStrictEqual(paths, ['condition', 'trueExpr', 'falseExpr'])

    assert.notStrictEqual(f, n)
    assert.strictEqual(f.condition, e)
    assert.strictEqual(f.trueExpr, a)
    assert.strictEqual(f.falseExpr, b)
  })

<<<<<<< HEAD
  it('should throw an error when the map callback does not return a node', function () {
=======
  it('should throw an error when the map callback does not return a node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      n.map(function () {
        return undefined
      })
    }, /Callback function must return a Node/)
  })

<<<<<<< HEAD
  it('should transform a ConditionalNodes condition', function () {
=======
  it('should transform a ConditionalNodes condition', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const e = new ConstantNode(4)
    const f = n.transform(function (node) {
      return node instanceof ConstantNode && node.value === 1 ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.condition, e)
    assert.deepStrictEqual(f.trueExpr, a)
    assert.deepStrictEqual(f.falseExpr, b)
  })

<<<<<<< HEAD
  it('should transform a ConditionalNodes trueExpr', function () {
=======
  it('should transform a ConditionalNodes trueExpr', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const e = new ConstantNode(4)
    const f = n.transform(function (node) {
      return node instanceof ConstantNode && node.value === 2 ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.condition, condition)
    assert.deepStrictEqual(f.trueExpr, e)
    assert.deepStrictEqual(f.falseExpr, b)
  })

<<<<<<< HEAD
  it('should transform a ConditionalNodes falseExpr', function () {
=======
  it('should transform a ConditionalNodes falseExpr', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const e = new ConstantNode(4)
    const f = n.transform(function (node) {
      return node instanceof ConstantNode && node.value === 3 ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.condition, condition)
    assert.deepStrictEqual(f.trueExpr, a)
    assert.deepStrictEqual(f.falseExpr, e)
  })

<<<<<<< HEAD
  it('should transform a ConditionalNode itself', function () {
=======
  it('should transform a ConditionalNode itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const n = new ConditionalNode(condition, a, b)

    const e = new ConstantNode(5)
    const f = n.transform(function (node) {
      return node instanceof ConditionalNode ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f, e)
  })

<<<<<<< HEAD
  it('should clone a ConditionalNode itself', function () {
=======
  it('should clone a ConditionalNode itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const condition = new ConstantNode(1)
    const a = new ConstantNode(2)
    const b = new ConstantNode(3)
    const c = new ConditionalNode(condition, a, b)

    const d = c.clone()

    assert(d instanceof ConditionalNode)
    assert.deepStrictEqual(d, c)
    assert.notStrictEqual(d, c)
    assert.strictEqual(d.condition, c.condition)
    assert.strictEqual(d.trueExpr, c.trueExpr)
    assert.strictEqual(d.falseExpr, c.falseExpr)
  })

<<<<<<< HEAD
  it('test equality another Node', function () {
=======
  it('test equality another Node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConditionalNode(
      new ConstantNode(1),
      new ConstantNode(2),
      new ConstantNode(3)
    )
    const b = new ConditionalNode(
      new ConstantNode(1),
      new ConstantNode(2),
      new ConstantNode(3)
    )
    const c = new ConditionalNode(
      new SymbolNode('x'),
      new ConstantNode(2),
      new ConstantNode(3)
    )
    const d = new ConditionalNode(
      new ConstantNode(1),
      new ConstantNode(5),
      new ConstantNode(3)
    )
    const e = new ConditionalNode(
      new ConstantNode(1),
      new ConstantNode(2),
      new ConstantNode(55)
    )

    assert.strictEqual(a.equals(null), false)
    assert.strictEqual(a.equals(undefined), false)
    assert.strictEqual(a.equals(b), true)
    assert.strictEqual(a.equals(c), false)
    assert.strictEqual(a.equals(d), false)
    assert.strictEqual(a.equals(e), false)
  })

<<<<<<< HEAD
  it("should respect the 'all' parenthesis option", function () {
=======
  it("should respect the 'all' parenthesis option", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.parse('a?b:c').toString({ parenthesis: 'all' }),
      '(a) ? (b) : (c)'
    )
  })

<<<<<<< HEAD
  it('should stringify a ConditionalNode', function () {
=======
  it('should stringify a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConditionalNode(condition, a, b)

    assert.strictEqual(n.toString(), 'true ? (a = 2) : (b = 3)')
  })

<<<<<<< HEAD
  it('should stringify a ConditionalNode with custom toString', function () {
=======
  it('should stringify a ConditionalNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ConditionalNode') {
        return (
          'if ' +
          node.condition.toString(options) +
          ' then ' +
          node.trueExpr.toString(options) +
          ' else ' +
          node.falseExpr.toString(options)
        )
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)

    const n = new ConditionalNode(a, b, c)

    assert.strictEqual(
      n.toString({ handler: customFunction }),
      'if const(1, number) then const(2, number) else const(3, number)'
    )
  })

<<<<<<< HEAD
  it('should stringify a ConditionalNode with custom toHTML', function () {
=======
  it('should stringify a ConditionalNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ConditionalNode') {
        return (
          'if ' +
          node.condition.toHTML(options) +
          ' then ' +
          node.trueExpr.toHTML(options) +
          ' else ' +
          node.falseExpr.toHTML(options)
        )
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)

    const n = new ConditionalNode(a, b, c)

    assert.strictEqual(
      n.toHTML({ handler: customFunction }),
      'if const(1, number) then const(2, number) else const(3, number)'
    )
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)
    const node = new ConditionalNode(a, b, c)

    const json = node.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'ConditionalNode',
      condition: a,
      trueExpr: b,
      falseExpr: c
    })

    const parsed = ConditionalNode.fromJSON(json)
    assert.deepStrictEqual(parsed, node)
  })

<<<<<<< HEAD
  it('should LaTeX a ConditionalNode', function () {
=======
  it('should LaTeX a ConditionalNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new ConditionalNode(condition, a, b)

    // note that b is enclosed in \\mathrm{...} since it's a unit
    assert.strictEqual(
      n.toTex(),
      '\\begin{cases} { a=2}, &\\quad{\\text{if }\\;true}\\\\{\\mathrm{b}=3}, &\\quad{\\text{otherwise}}\\end{cases}'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a ConditionalNode with custom toTex', function () {
=======
  it('should LaTeX a ConditionalNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ConditionalNode') {
        return (
          'if ' +
          node.condition.toTex(options) +
          ' then ' +
          node.trueExpr.toTex(options) +
          ' else ' +
          node.falseExpr.toTex(options)
        )
      } else if (node.type === 'ConstantNode') {
        return (
          'const\\left(' +
          node.value +
          ', ' +
          math.typeOf(node.value) +
          '\\right)'
        )
      }
    }

    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)

    const n = new ConditionalNode(a, b, c)

    assert.strictEqual(
      n.toTex({ handler: customFunction }),
      'if const\\left(1, number\\right) then const\\left(2, number\\right) else const\\left(3, number\\right)'
    )
  })
})
