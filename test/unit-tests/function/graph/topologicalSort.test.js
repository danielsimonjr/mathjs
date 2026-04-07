import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTopologicalSort } from '../../../../src/function/graph/topologicalSort.js'

const math = create({ ...all, createTopologicalSort })

describe('topologicalSort', function () {
  it('should return a valid topological order for a simple DAG', function () {
    const graph = { 0: [1, 2], 1: [3], 2: [3], 3: [] }
    const result = math.topologicalSort(graph)
    assert.strictEqual(result.length, 4)

    // Verify 0 comes before 1,2 and both come before 3
    const pos = {}
    result.forEach(function (node, i) { pos[node] = i })
    assert.ok(pos[0] < pos[1], '0 must come before 1')
    assert.ok(pos[0] < pos[2], '0 must come before 2')
    assert.ok(pos[1] < pos[3], '1 must come before 3')
    assert.ok(pos[2] < pos[3], '2 must come before 3')
  })

  it('should handle a linear chain', function () {
    const graph = { 0: [1], 1: [2], 2: [3], 3: [] }
    const result = math.topologicalSort(graph)
    assert.deepStrictEqual(result, [0, 1, 2, 3])
  })

  it('should throw an error if the graph has a cycle', function () {
    const graph = { 0: [1], 1: [2], 2: [0] }
    assert.throws(
      function () { math.topologicalSort(graph) },
      /cycle/i
    )
  })

  it('should handle string node labels', function () {
    const graph = { A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }
    const result = math.topologicalSort(graph)
    assert.strictEqual(result.length, 4)

    const pos = {}
    result.forEach(function (node, i) { pos[node] = i })
    assert.ok(pos.A < pos.B)
    assert.ok(pos.A < pos.C)
    assert.ok(pos.B < pos.D)
    assert.ok(pos.C < pos.D)
  })

  it('should handle a graph with no edges (all isolated nodes)', function () {
    const graph = { 0: [], 1: [], 2: [] }
    const result = math.topologicalSort(graph)
    assert.strictEqual(result.length, 3)
  })

  it('should handle a single node with no edges', function () {
    const graph = { 0: [] }
    const result = math.topologicalSort(graph)
    assert.deepStrictEqual(result, [0])
  })

  it('should throw for a self-loop', function () {
    const graph = { 0: [0] }
    assert.throws(
      function () { math.topologicalSort(graph) },
      /cycle/i
    )
  })
})
