<<<<<<< HEAD
// @ts-nocheck
// test IndexNode
=======
/**
 * Test for IndexNode - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const Node = math.Node
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode
const IndexNode = math.IndexNode
const RangeNode = math.RangeNode

<<<<<<< HEAD
describe('IndexNode', function () {
  it('should create a IndexNode', function () {
=======
describe('IndexNode', function (): void {
  it('should create a IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new IndexNode([])
    assert(n instanceof IndexNode)
    assert(n instanceof Node)
    assert.strictEqual(n.type, 'IndexNode')
  })

<<<<<<< HEAD
  it('should have isIndexNode', function () {
=======
  it('should have isIndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = new IndexNode([])
    assert(node.isIndexNode)
  })

<<<<<<< HEAD
  it('should throw an error when calling with wrong arguments', function () {
    assert.throws(function () {
      console.log(new IndexNode())
    }, TypeError)
    assert.throws(function () {
      console.log(new IndexNode('a'))
    }, TypeError)
    assert.throws(function () {
      console.log(new IndexNode(new Node()))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error when calling with wrong arguments', function (): void {
    assert.throws(function (): void {
      console.log(new IndexNode())
    }, TypeError)
    assert.throws(function (): void {
      console.log(new IndexNode('a'))
    }, TypeError)
    assert.throws(function (): void {
      console.log(new IndexNode(new Node()))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      console.log(new IndexNode([new Node(), 3]))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error when calling without new operator', function () {
    assert.throws(function () {
=======
  it('should throw an error when calling without new operator', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      IndexNode([])
    }, TypeError)
  })

<<<<<<< HEAD
  it('should filter an IndexNode', function () {
=======
  it('should filter an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof IndexNode
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof RangeNode
      }),
      []
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode
      }),
      [b, c]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode && node.value === 2
      }),
      [b]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode && node.value === 4
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should filter an empty IndexNode', function () {
=======
  it('should filter an empty IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const n = new IndexNode([])

    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof IndexNode
      }),
      [n]
    )
    assert.deepStrictEqual(
      n.filter(function (node) {
        return node instanceof ConstantNode
      }),
      []
    )
  })

<<<<<<< HEAD
  it('should run forEach on an IndexNode', function () {
=======
  it('should run forEach on an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2n)
    const c = new ConstantNode(1n)
    const n = new IndexNode([b, c])

    const nodes = []
    const paths = []
    n.forEach(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)
    })

    assert.strictEqual(nodes.length, 2)
    assert.strictEqual(nodes[0], b)
    assert.strictEqual(nodes[1], c)
    assert.deepStrictEqual(paths, ['dimensions[0]', 'dimensions[1]'])
  })

<<<<<<< HEAD
  it('should map an IndexNode', function () {
=======
  it('should map an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

    const nodes = []
    const paths = []
    const e = new ConstantNode(-1)
    const f = n.map(function (node, path, parent) {
      nodes.push(node)
      paths.push(path)
      assert.strictEqual(parent, n)

      return node.isConstantNode && node.value === 1 ? e : node
    })

    assert.strictEqual(nodes.length, 2)
    assert.strictEqual(nodes[0], b)
    assert.strictEqual(nodes[1], c)
    assert.deepStrictEqual(paths, ['dimensions[0]', 'dimensions[1]'])

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.dimensions[0], b)
    assert.deepStrictEqual(f.dimensions[1], e)
  })

<<<<<<< HEAD
  it('should copy dotNotation property when mapping an IndexNode', function () {
=======
  it('should copy dotNotation property when mapping an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode('objprop')
    const n = new IndexNode([b], true)
    const f = n.map(function (node, _path, _parent) {
      return node
    })

    assert.strictEqual(n.dotNotation, f.dotNotation)
  })

<<<<<<< HEAD
  it('should throw an error when the map callback does not return a node', function () {
=======
  it('should throw an error when the map callback does not return a node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

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
  it('should transform an IndexNodes (nested) parameters', function () {
=======
  it('should transform an IndexNodes (nested) parameters', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

    const e = new SymbolNode('c')
    const f = n.transform(function (node) {
      return node.isConstantNode && node.value === 1 ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f.dimensions[0], b)
    assert.deepStrictEqual(f.dimensions[1], e)
  })

<<<<<<< HEAD
  it('should transform an IndexNode itself', function () {
=======
  it('should transform an IndexNode itself', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

    const e = new ConstantNode(5)
    const f = n.transform(function (node) {
      return node.isIndexNode ? e : node
    })

    assert.notStrictEqual(f, n)
    assert.deepStrictEqual(f, e)
  })

<<<<<<< HEAD
  it('should clone an IndexNode', function () {
=======
  it('should clone an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode(2)
    const c = new ConstantNode(1)
    const n = new IndexNode([b, c])

    const d = n.clone()
    assert(d.isIndexNode)
    assert.deepStrictEqual(d, n)
    assert.notStrictEqual(d, n)
    assert.notStrictEqual(d.dimensions, n.dimensions)
    assert.strictEqual(d.dimensions[0], n.dimensions[0])
    assert.strictEqual(d.dimensions[1], n.dimensions[1])
  })

<<<<<<< HEAD
  it('should clone an IndexNode with dotNotation property', function () {
=======
  it('should clone an IndexNode with dotNotation property', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const b = new ConstantNode('objprop')
    const n = new IndexNode([b], true)
    const f = n.clone()

    assert.strictEqual(n.dotNotation, f.dotNotation)
  })

<<<<<<< HEAD
  it('test equality another Node', function () {
=======
  it('test equality another Node', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = new IndexNode([new ConstantNode(2), new ConstantNode(1)])
    const b = new IndexNode([new ConstantNode(2), new ConstantNode(1)])
    const c = new IndexNode([new ConstantNode(2)])
    const d = new IndexNode([
      new ConstantNode(2),
      new ConstantNode(1),
      new ConstantNode(3)
    ])
    const e = new IndexNode([new ConstantNode(2), new ConstantNode(4)])
    const f = new SymbolNode('x')

    assert.strictEqual(a.equals(null), false)
    assert.strictEqual(a.equals(undefined), false)
    assert.strictEqual(a.equals(b), true)
    assert.strictEqual(a.equals(c), false)
    assert.strictEqual(a.equals(d), false)
    assert.strictEqual(a.equals(e), false)
    assert.strictEqual(a.equals(f), false)
  })

<<<<<<< HEAD
  it('should stringify an IndexNode', function () {
=======
  it('should stringify an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const dimensions = [new ConstantNode(2), new ConstantNode(1)]

    const n = new IndexNode(dimensions)
    assert.strictEqual(n.toString(), '[2, 1]')

    const n2 = new IndexNode([])
    assert.strictEqual(n2.toString(), '[]')
  })

<<<<<<< HEAD
  it('should stringify an IndexNode with dot notation', function () {
=======
  it('should stringify an IndexNode with dot notation', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const dimensions = [new ConstantNode('a')]

    const n = new IndexNode(dimensions, true)
    assert.strictEqual(n.toString(), '.a')
  })

<<<<<<< HEAD
  it('should stringify an IndexNode with custom toString', function () {
=======
  it('should stringify an IndexNode with custom toString', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'IndexNode') {
        return node.dimensions
          .map(function (range) {
            return range.toString(options)
          })
          .join(', ')
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const b = new ConstantNode(1)
    const c = new ConstantNode(2)

    const n = new IndexNode([b, c])

    assert.strictEqual(
      n.toString({ handler: customFunction }),
      'const(1, number), const(2, number)'
    )
  })

<<<<<<< HEAD
  it('should stringify an IndexNode with custom toHTML', function () {
=======
  it('should stringify an IndexNode with custom toHTML', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'IndexNode') {
        return node.dimensions
          .map(function (range) {
            return range.toHTML(options)
          })
          .join(', ')
      } else if (node.type === 'ConstantNode') {
        return 'const(' + node.value + ', ' + math.typeOf(node.value) + ')'
      }
    }

    const b = new ConstantNode(1)
    const c = new ConstantNode(2)

    const n = new IndexNode([b, c])

    assert.strictEqual(
      n.toHTML({ handler: customFunction }),
      'const(1, number), const(2, number)'
    )
  })

<<<<<<< HEAD
  it('toJSON and fromJSON', function () {
=======
  it('toJSON and fromJSON', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const prop = new ConstantNode('prop')
    const node = new IndexNode([prop], true)

    const json = node.toJSON()

    assert.deepStrictEqual(json, {
      mathjs: 'IndexNode',
      dimensions: [prop],
      dotNotation: true
    })

    const parsed = IndexNode.fromJSON(json)
    assert.deepStrictEqual(parsed, node)
  })

<<<<<<< HEAD
  it('should LaTeX an IndexNode', function () {
=======
  it('should LaTeX an IndexNode', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const dimensions = [new ConstantNode(2), new ConstantNode(1)]

    const n = new IndexNode(dimensions)
    assert.strictEqual(n.toTex(), '_{2,1}')

    const n2 = new IndexNode([])
    assert.strictEqual(n2.toTex(), '_{}')
  })

<<<<<<< HEAD
  it('should LaTeX an IndexNode with dot notation', function () {
=======
  it('should LaTeX an IndexNode with dot notation', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const dimensions = [new ConstantNode('a')]

    const n = new IndexNode(dimensions, true)
    assert.strictEqual(n.toString(), '.a')
  })

<<<<<<< HEAD
  it('should LaTeX an IndexNode with custom toTex', function () {
=======
  it('should LaTeX an IndexNode with custom toTex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Also checks if the custom functions get passed on to the children
    const customFunction = function (node, options) {
      if (node.type === 'IndexNode') {
        return node.dimensions
          .map(function (range) {
            return range.toTex(options)
          })
          .join(', ')
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

    const b = new ConstantNode(1)
    const c = new ConstantNode(2)
    const n = new IndexNode([b, c])

    assert.strictEqual(
      n.toTex({ handler: customFunction }),
      'const\\left(1, number\\right), const\\left(2, number\\right)'
    )
  })
})
