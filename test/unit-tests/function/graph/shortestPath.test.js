import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createShortestPath } from '../../../../src/function/graph/shortestPath.js'

const math = create({ ...all, createShortestPath })

describe('shortestPath', function () {
  describe('numeric nodes', function () {
    it('should find shortest path in diamond graph', function () {
      // 0→1 weight 1, 1→3 weight 1, 0→2 weight 4, 2→3 weight 3
      const graph = {
        0: [[1, 1], [2, 4]],
        1: [[3, 1]],
        2: [[3, 3]],
        3: []
      }
      const result = math.shortestPath(graph, 0, 3)
      assert.strictEqual(result.distance, 2)
      assert.deepStrictEqual(result.path, [0, 1, 3])
    })

    it('should find direct path when it is the shortest', function () {
      const graph = {
        0: [[1, 1], [2, 10]],
        1: [[2, 1]],
        2: []
      }
      const result = math.shortestPath(graph, 0, 2)
      assert.strictEqual(result.distance, 2)
      assert.deepStrictEqual(result.path, [0, 1, 2])
    })

    it('should return distance Infinity and empty path when no path exists', function () {
      const graph = {
        0: [[1, 1]],
        1: [],
        2: [[3, 1]],
        3: []
      }
      const result = math.shortestPath(graph, 0, 2)
      assert.strictEqual(result.distance, Infinity)
      assert.deepStrictEqual(result.path, [])
    })

    it('should return path of length 0 for start === end', function () {
      const graph = { 0: [[1, 1]], 1: [] }
      const result = math.shortestPath(graph, 0, 0)
      assert.strictEqual(result.distance, 0)
      assert.deepStrictEqual(result.path, [0])
    })
  })

  describe('string nodes', function () {
    it('should find shortest path with string node labels — A to D via B, distance 2', function () {
      // A→B(1), A→C(1), B→D(1), C→D(3) — shortest A→D = 2 via B
      const graph = {
        A: [['B', 1], ['C', 1]],
        B: [['A', 1], ['D', 1]],
        C: [['A', 1], ['D', 3]],
        D: [['B', 1], ['C', 3]]
      }
      const result = math.shortestPath(graph, 'A', 'D')
      assert.strictEqual(result.distance, 2)
      assert.deepStrictEqual(result.path, ['A', 'B', 'D'])
    })

    it('should return Infinity path for disconnected string graph', function () {
      const graph = {
        A: [['B', 1]],
        B: [],
        C: [['D', 1]],
        D: []
      }
      const result = math.shortestPath(graph, 'A', 'C')
      assert.strictEqual(result.distance, Infinity)
      assert.deepStrictEqual(result.path, [])
    })
  })

  describe('edge weights', function () {
    it('should choose the lower-weight path over the shorter hop path', function () {
      // 0→2 direct has weight 10; 0→1→2 has weight 1+1=2
      const graph = {
        0: [[1, 1], [2, 10]],
        1: [[2, 1]],
        2: []
      }
      const result = math.shortestPath(graph, 0, 2)
      assert.strictEqual(result.distance, 2)
    })
  })
})
