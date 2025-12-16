<<<<<<< HEAD
// @ts-nocheck
// test parse
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for parse - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const Node = math.Node
const ArrayNode = math.ArrayNode
const ObjectNode = math.ObjectNode
const FunctionNode = math.FunctionNode
const OperatorNode = math.OperatorNode

<<<<<<< HEAD
describe('parse', function () {
  it('should parse an expression', function () {
=======
describe('parse', function (): void {
  it('should parse an expression', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const node = math.parse('(5+3)/4')
    assert.ok(node instanceof Node)
    assert.strictEqual(node.compile().evaluate(), 2)
  })

<<<<<<< HEAD
  it('should parse multiple expressions', function () {
=======
  it('should parse multiple expressions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const nodes = math.parse(['2+3', '4+5'])
    assert.ok(Array.isArray(nodes))
    assert.strictEqual(nodes.length, 2)

    assert.ok(nodes[0] instanceof Node)
    assert.ok(nodes[1] instanceof Node)
    assert.strictEqual(nodes[0].compile().evaluate(), 5)
    assert.strictEqual(nodes[1].compile().evaluate(), 9)
  })

<<<<<<< HEAD
  it('should parse expressions with internal newlines', function () {
=======
  it('should parse expressions with internal newlines', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.ok(math.parse('[1,\n2]') instanceof ArrayNode)
    assert.ok(math.parse('{x:1,\n y:2}') instanceof ObjectNode)
    assert.ok(math.parse('f(x,\n y)') instanceof FunctionNode)
    assert.ok(math.parse('3+\n7') instanceof OperatorNode)
  })

<<<<<<< HEAD
  it('should parse expressions with internal newlines and comments', function () {
=======
  it('should parse expressions with internal newlines and comments', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.ok(math.parse('[1, # One\n2]') instanceof ArrayNode)
    assert.ok(math.parse('{x:1, # x-coordinate\n y:2}') instanceof ObjectNode)
    assert.ok(math.parse('f(x, # first argument\n y)') instanceof FunctionNode)
    assert.ok(math.parse('3+#ignored terms\n7') instanceof OperatorNode)
  })

<<<<<<< HEAD
  it('should LaTeX parse', function () {
=======
  it('should LaTeX parse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('parse(expr,options)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{parse}\\left( expr, options\\right)'
    )
  })
})
