<<<<<<< HEAD
// @ts-nocheck
// test ArrayNode
=======
/**
 * Test for ArrayNode - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const RangeNode = math.RangeNode
const ArrayNode = math.ArrayNode

<<<<<<< HEAD
describe('ArrayNode', function () {
  it('should create an ArrayNode', function () {
=======
describe('ArrayNode', function (): void {
  it('should create an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = new ConstantNode(1)
    const a = new ArrayNode([c])
    const b = new ArrayNode([])
    assert(a instanceof ArrayNode)
    assert(b instanceof ArrayNode)
    assert.strictEqual(a.type, 'ArrayNode')
    assert.strictEqual(b.type, 'ArrayNode')
  })

<<<<<<< HEAD
  it('should have property isArrayNode', function () {
=======
  it('should have property isArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new ArrayNode([])

    assert(node.isArrayNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when calling without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      ArrayNode()
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error on wrong constructor arguments', function () {
    assert.throws(function () {
      console.log(new ArrayNode(2))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error on wrong constructor arguments', function (): void {
    assert.throws(function (): void {
      console.log(new ArrayNode(2))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new ArrayNode([2, 3]))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should evaluate an ArrayNode', function () {
=======
  it('should evaluate an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = new ConstantNode(1)
    const a = new ArrayNode([c])
    const b = new ArrayNode()

    assert.deepStrictEqual(a.compile().evaluate(), math.matrix([1]))
    assert.deepStrictEqual(b.compile().evaluate(), math.matrix([]))
  })

<<<<<<< HEAD
  it('should compile an ArrayNode and evaluate as Matrix', function () {
=======
  it('should compile an ArrayNode and evaluate as Matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)
    const d = new ConstantNode(4)
    const n = new ArrayNode([a, b, c, d])

    const expr = n.compile()
    assert.deepStrictEqual(expr.evaluate(), math.matrix([1, 2, 3, 4]))
  })

<<<<<<< HEAD
  it('should compile an ArrayNode and evaluate as Array', function () {
=======
  it('should compile an ArrayNode and evaluate as Array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const mathArray = math.create({ matrix: 'Array' })
    const a = new mathArray.ConstantNode(1)
    const b = new mathArray.ConstantNode(2)
    const c = new mathArray.ConstantNode(3)
    const d = new mathArray.ConstantNode(4)
    const n = new mathArray.ArrayNode([a, b, c, d])
    const expr = n.compile()
    assert.deepStrictEqual(expr.evaluate(), [1, 2, 3, 4])
  })

<<<<<<< HEAD
  it('should compile nested ArrayNodes', function () {
=======
  it('should compile nested ArrayNodes', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)
    const d = new ConstantNode(4)

    const n2 = new ArrayNode([a, b])
    const n3 = new ArrayNode([c, d])
    const n4 = new ArrayNode([n2, n3])

    const expr = n4.compile()
    assert.deepStrictEqual(
      expr.evaluate(),
      math.matrix([
        [1, 2],
        [3, 4]
      ])
    )
  })

<<<<<<< HEAD
  it('should find an ArrayNode', function () {
=======
  it('should find an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new SymbolNode('x')
    const c = new ConstantNode(2)
    const d = new ArrayNode([a, b, c])

    assert.deepStrictEqual(
      d.filter(function (node) {
        return node instanceof ArrayNode
      }),
      [d]
    )
    assert.deepStrictEqual(
      d.filter(function (node) {
        return node instanceof SymbolNode
      }),
      [b]
    )
    assert.deepStrictEqual(
      d.filter(function (node) {
        return node instanceof RangeNode
      }),
      []
    )
    assert.deepStrictEqual(
      d.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [a, c]
    )
    assert.deepStrictEqual(
      d.filter(function (node) {
        return node instanceof ConstantNode && node.value === 2
      }),
      [c]
    )
  })

<<<<<<< HEAD
  it('should run forEach on an ArrayNode', function () {
=======
  it('should run forEach on an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    const nodes = []
    const paths = []
    c.forEach(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, c)
    })

    assert.deepStrictEqual(paths, ['items[0]', 'items[1]'])
    assert.strictEqual(nodes.length, 2)
    assert.strictEqual(nodes[0], a)
    assert.strictEqual(nodes[1], b)
  })

<<<<<<< HEAD
  it('should map an ArrayNode', function () {
=======
  it('should map an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    const d = new ConstantNode(3)
    const nodes = []
    const paths = []
    const e = c.map(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, c)

      return node instanceof SymbolNode && node.name === 'x' ? d : node
    })

    assert.deepStrictEqual(paths, ['items[0]', 'items[1]'])
    assert.strictEqual(nodes.length, 2)
    assert.strictEqual(nodes[0], a)
    assert.strictEqual(nodes[1], b)

    assert.notStrictEqual(e, c)
    assert.deepStrictEqual(e.items[0], d)
    assert.deepStrictEqual(e.items[1], b)
  })

<<<<<<< HEAD
  it('should throw an error when the map callback does not return a node', function () {
=======
  it('should throw an error when the map callback does not return a node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      c.map(function () {
        return undefined
      })
    }, /Callback function must return a Node/)
  })

<<<<<<< HEAD
  it('should transform an ArrayNodes parameters', function () {
=======
  it('should transform an ArrayNodes parameters', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    const d = new ConstantNode(3)
    const e = c.transform(function (node) {
      return node instanceof SymbolNode && node.name === 'x' ? d : node
    })

    assert.notStrictEqual(e, c)
    assert.deepStrictEqual(e.items[0], d)
    assert.deepStrictEqual(e.items[1], b)
  })

<<<<<<< HEAD
  it('should transform an ArrayNode itself', function () {
=======
  it('should transform an ArrayNode itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    const d = new ConstantNode(3)
    const e = c.transform(function (node) {
      return node instanceof ArrayNode ? d : node
    })

    assert.notStrictEqual(e, c)
    assert.deepStrictEqual(e, d)
  })

<<<<<<< HEAD
  it('should traverse an ArrayNode', function () {
=======
  it('should traverse an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    let count = 0
    c.traverse(function (node, path, parent) {
      count++

      switch (count) {
        case 1:
          assert.strictEqual(node, c)
          assert.strictEqual(path, null)
          assert.strictEqual(parent, null)
          break

        case 2:
          assert.strictEqual(node, a)
          assert.strictEqual(path, 'items[0]')
          assert.strictEqual(parent, c)
          break

        case 3:
          assert.strictEqual(node, b)
          assert.strictEqual(path, 'items[1]')
          assert.strictEqual(parent, c)
          break
      }
    })

    assert.strictEqual(count, 3)
  })

<<<<<<< HEAD
  it('should clone an ArrayNode', function () {
=======
  it('should clone an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    const d = c.clone()
    assert(d instanceof ArrayNode)
    assert.deepStrictEqual(c, d)
    assert.notStrictEqual(c, d)
    assert.strictEqual(c.items[0], d.items[0])
    assert.strictEqual(c.items[1], d.items[1])
  })

<<<<<<< HEAD
  it('test equality with other nodes', function () {
=======
  it('test equality with other nodes', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, 2]
    const a = new SymbolNode('x')
    const b = new ConstantNode(2)
    const c = new ArrayNode([a, b])

    assert.strictEqual(c.equals(null), false)
    assert.strictEqual(c.equals(undefined), false)
    assert.strictEqual(
      c.equals(new ArrayNode([new SymbolNode('x'), new ConstantNode(2)])),
      true
    )
    assert.strictEqual(
      c.equals(
        new ArrayNode([
          new SymbolNode('x'),
          new ConstantNode(2),
          new ConstantNode(3)
        ])
      ),
      false
    )
    assert.strictEqual(
      c.equals(new ArrayNode([new SymbolNode('x'), new ConstantNode(3)])),
      false
    )
    assert.strictEqual(c.equals(new ArrayNode([new SymbolNode('x')])), false)
  })

<<<<<<< HEAD
  it('should stringify an ArrayNode', function () {
=======
  it('should stringify an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)
    const d = new ConstantNode(4)
    const n = new ArrayNode([a, b, c, d])

    assert.strictEqual(n.toString(), '[1, 2, 3, 4]')
  })

<<<<<<< HEAD
  it('should stringify an ArrayNode with custom toString', function () {
=======
  it('should stringify an ArrayNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ArrayNode') {
        let string = '['
        node.items.forEach(function (item) {
          string += item.toString(options) + ', '
        })

        string += ']'
        return string
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)
    const b = new ConstantNode(2)

    const n = new ArrayNode([a, b])

    assert.strictEqual(
      n.toString({ handler: customFunction }),
      '[const(1, number), const(2, number), ]'
    )
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(1)
    const c = new ConstantNode(2)

    const node = new ArrayNode([b, c])

    const json = node.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'ArrayNode',
      items: [b, c]
    })

    const parsed = ArrayNode.fromJSON(json)
    assert.deepStrictEqual(parsed, node)
  })

<<<<<<< HEAD
  it('should LaTeX an ArrayNode', function () {
=======
  it('should LaTeX an ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)
    const d = new ConstantNode(4)
    const v1 = new ArrayNode([a, b])
    const v2 = new ArrayNode([c, d])
    const n = new ArrayNode([v1, v2])

    assert.strictEqual(n.toTex(), '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}')
  })

<<<<<<< HEAD
  it('should LaTeX a nested ArrayNode', function () {
=======
  it('should LaTeX a nested ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x, [y, [z]]]
    const a = new ConstantNode(1)
    const b = new ConstantNode(2)
    const c = new ConstantNode(3)

    const v1 = new ArrayNode([c])
    const v2 = new ArrayNode([b, v1])
    const n = new ArrayNode([a, v2])

    assert.strictEqual(
      n.toTex(),
      '\\begin{bmatrix}1&\\begin{bmatrix}2&\\begin{bmatrix}3\\end{bmatrix}\\end{bmatrix}\\end{bmatrix}'
    )
  })

<<<<<<< HEAD
  it('should LaTeX a nested ArrayNode', function () {
=======
  it('should LaTeX a nested ArrayNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // [x; [y; [z]]]
    const v = new ArrayNode([
      new ArrayNode([new ConstantNode(1)]),
      new ArrayNode([
        new ArrayNode([
          new ArrayNode([new ConstantNode(2)]),
          new ArrayNode([new ArrayNode([new ConstantNode(3)])])
        ])
      ])
    ])
    assert.strictEqual(
      v.toTex(),
      '\\begin{bmatrix}1\\\\\\begin{bmatrix}2\\\\\\begin{bmatrix}3\\end{bmatrix}\\end{bmatrix}\\end{bmatrix}'
    )
  })

<<<<<<< HEAD
  it('should LaTeX an ArrayNode with custom toTex', function () {
=======
  it('should LaTeX an ArrayNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ArrayNode') {
        let latex = '\\left['
        node.items.forEach(function (item) {
          latex += item.toTex(options) + ', '
        })

        latex += '\\right]'
        return latex
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

    const n = new ArrayNode([a, b])

    assert.strictEqual(
      n.toTex({ handler: customFunction }),
      '\\left[const\\left(1, number\\right), const\\left(2, number\\right), \\right]'
    )
  })

<<<<<<< HEAD
  it('should stringify an ArrayNode with custom toHTML', function () {
=======
  it('should stringify an ArrayNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'ArrayNode') {
        let latex = '['
        node.items.forEach(function (item) {
          latex += item.toHTML(options) + ', '
        })

        latex += ']'
        return latex
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const a = new ConstantNode(1)
    const b = new ConstantNode(2)

    const n = new ArrayNode([a, b])

    assert.strictEqual(
      n.toHTML({ handler: customFunction }),
      '[const(1, number), const(2, number), ]'
    )
  })
})
