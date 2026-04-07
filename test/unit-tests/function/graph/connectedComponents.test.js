import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createConnectedComponents } from '../../../../src/function/graph/connectedComponents.js'

const math = create({ ...all, createConnectedComponents })

describe('connectedComponents', function () {
  it('should find two components in a split numeric graph', function () {
    const graph = { 0: [1], 1: [0], 2: [3], 3: [2] }
    const result = math.connectedComponents(graph)
    assert.strictEqual(result.length, 2)

    // Sort components and their contents for deterministic comparison
    const sorted = result.map(function (c) { return c.map(Number).sort(function (a, b) { return a - b }) })
    sorted.sort(function (a, b) { return a[0] - b[0] })
    assert.deepStrictEqual(sorted, [[0, 1], [2, 3]])
  })

  it('should find a single component when all nodes are connected', function () {
    const graph = { 0: [1, 2], 1: [0, 2], 2: [0, 1] }
    const result = math.connectedComponents(graph)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 3)
  })

  it('should treat each isolated node as its own component', function () {
    const graph = { 0: [], 1: [], 2: [] }
    const result = math.connectedComponents(graph)
    assert.strictEqual(result.length, 3)
    result.forEach(function (c) { assert.strictEqual(c.length, 1) })
  })

  it('should handle string node labels', function () {
    const graph = { A: ['B', 'C'], B: ['A'], C: ['A'], D: [] }
    const result = math.connectedComponents(graph)
    assert.strictEqual(result.length, 2)

    const sizes = result.map(function (c) { return c.length }).sort(function (a, b) { return a - b })
    assert.deepStrictEqual(sizes, [1, 3])
  })

  it('should handle a graph with a single node', function () {
    const graph = { 0: [] }
    const result = math.connectedComponents(graph)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 1)
  })

  it('should handle an empty graph', function () {
    const graph = {}
    const result = math.connectedComponents(graph)
    assert.deepStrictEqual(result, [])
  })
})
