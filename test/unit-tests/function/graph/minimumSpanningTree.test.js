import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMinimumSpanningTree } from '../../../../src/function/graph/minimumSpanningTree.js'

const math = create({ ...all, createMinimumSpanningTree })

describe('minimumSpanningTree', function () {
  it('should find the MST of a triangle graph', function () {
    // Edges: 0-1(1), 1-2(2), 0-2(3)
    // MST should include 0-1(1) and 1-2(2), total weight 3
    const edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3]]
    const result = math.minimumSpanningTree(edges, 3)

    assert.strictEqual(result.length, 2)
    const totalWeight = result.reduce(function (sum, e) { return sum + e[2] }, 0)
    assert.strictEqual(totalWeight, 3)
  })

  it('should always pick the cheapest edges without forming cycles', function () {
    // 4-node graph: 0-1(4), 0-2(3), 1-2(1), 1-3(2), 2-3(4)
    // MST: 1-2(1), 1-3(2), 0-2(3), total weight 6
    const edges = [[0, 1, 4], [0, 2, 3], [1, 2, 1], [1, 3, 2], [2, 3, 4]]
    const result = math.minimumSpanningTree(edges, 4)

    assert.strictEqual(result.length, 3)
    const totalWeight = result.reduce(function (sum, e) { return sum + e[2] }, 0)
    assert.strictEqual(totalWeight, 6)
  })

  it('should return n-1 edges for a connected graph with n nodes', function () {
    const edges = [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 4, 4]]
    const result = math.minimumSpanningTree(edges, 5)
    assert.strictEqual(result.length, 4)
  })

  it('should handle a single edge (2 nodes)', function () {
    const edges = [[0, 1, 5]]
    const result = math.minimumSpanningTree(edges, 2)
    assert.strictEqual(result.length, 1)
    assert.deepStrictEqual(result[0], [0, 1, 5])
  })

  it('should return correct MST edges from the expected test values', function () {
    // Triangle: 0-1(1), 1-2(2), 0-2(3)
    const edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3]]
    const result = math.minimumSpanningTree(edges, 3)

    // MST must contain the two cheapest non-cycle edges
    const edgeKeys = result.map(function (e) { return e[0] + '-' + e[1] + ':' + e[2] }).sort()
    assert.ok(edgeKeys.includes('0-1:1'), 'MST should include edge 0-1 with weight 1')
    assert.ok(edgeKeys.includes('1-2:2'), 'MST should include edge 1-2 with weight 2')
  })

  it('should handle graphs with equal-weight edges', function () {
    const edges = [[0, 1, 1], [1, 2, 1], [0, 2, 1]]
    const result = math.minimumSpanningTree(edges, 3)
    assert.strictEqual(result.length, 2)
    const totalWeight = result.reduce(function (sum, e) { return sum + e[2] }, 0)
    assert.strictEqual(totalWeight, 2)
  })
})
