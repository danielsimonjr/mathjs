import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createGraphDistance } from '../../../../src/function/graph/graphDistance.js'

const math = create({ ...all, createGraphDistance })

describe('graphDistance', function () {
  it('should return 1 for direct connection with weight 1', function () {
    const graph = { 0: [[1, 3], [2, 1]], 1: [[2, 1]], 2: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 2), 1)
  })

  it('should find shortest path through intermediate node', function () {
    // 0->2 direct weight 9, 0->1->2 weight 1+3=4
    const graph = { 0: [[1, 1], [2, 9]], 1: [[2, 3]], 2: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 2), 4)
  })

  it('should return Infinity when no path exists', function () {
    const graph = { 0: [[1, 1]], 1: [], 2: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 2), Infinity)
  })

  it('should return 0 when start equals end', function () {
    const graph = { 0: [[1, 1]], 1: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 0), 0)
  })

  it('should work with string node labels', function () {
    const graph = { A: [['B', 2], ['C', 5]], B: [['C', 1]], C: [] }
    assert.strictEqual(math.graphDistance(graph, 'A', 'C'), 3)
  })

  it('should find the correct shortest path in a diamond graph', function () {
    // 0→1(w=1), 0→2(w=4), 1→3(w=1), 2→3(w=3) => shortest=2 via 0→1→3
    const graph = { 0: [[1, 1], [2, 4]], 1: [[3, 1]], 2: [[3, 3]], 3: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 3), 2)
  })

  it('should prefer lower-weight path over fewer hops', function () {
    // 0→1(w=1), 0→2(w=10), 1→2(w=1) => shortest via 1, distance=2
    const graph = { 0: [[1, 1], [2, 10]], 1: [[2, 1]], 2: [] }
    assert.strictEqual(math.graphDistance(graph, 0, 2), 2)
  })

  it('should return direct distance if direct edge is cheapest', function () {
    const graph = { 0: [[1, 5], [2, 100]], 1: [[2, 100]], 2: [] }
    // direct 0→2 is 100, via 1 is 5+100=105
    assert.strictEqual(math.graphDistance(graph, 0, 2), 100)
  })
})
