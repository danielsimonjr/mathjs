import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createAdjacencyMatrix } from '../../../../src/function/graph/adjacencyMatrix.js'

const math = create({ ...all, createAdjacencyMatrix })

describe('adjacencyMatrix', function () {
  describe('unweighted directed (default)', function () {
    it('should convert a directed triangle edge list to adjacency matrix', function () {
      const result = math.adjacencyMatrix([[0, 1], [1, 2], [2, 0]])
      assert.deepStrictEqual(result, [
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 0]
      ])
    })

    it('should handle a single edge', function () {
      const result = math.adjacencyMatrix([[0, 1]], 2)
      assert.deepStrictEqual(result, [
        [0, 1],
        [0, 0]
      ])
    })

    it('should handle an empty edge list with n specified', function () {
      const result = math.adjacencyMatrix([], 3)
      assert.deepStrictEqual(result, [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ])
    })

    it('should auto-detect n from max node index', function () {
      const result = math.adjacencyMatrix([[0, 2]])
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0][2], 1)
    })
  })

  describe('weighted directed', function () {
    it('should use weights when provided', function () {
      const result = math.adjacencyMatrix([[0, 1, 5], [1, 2, 3]], 3)
      assert.deepStrictEqual(result, [
        [0, 5, 0],
        [0, 0, 3],
        [0, 0, 0]
      ])
    })

    it('should use weight 1 for unweighted edges', function () {
      const result = math.adjacencyMatrix([[0, 1], [1, 2]], 3)
      assert.strictEqual(result[0][1], 1)
      assert.strictEqual(result[1][2], 1)
    })
  })

  describe('undirected option', function () {
    it('should fill both directions for undirected graph', function () {
      const result = math.adjacencyMatrix([[0, 1], [1, 2]], 3, { undirected: true })
      assert.deepStrictEqual(result, [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0]
      ])
    })

    it('should fill both directions with weights for undirected weighted graph', function () {
      const result = math.adjacencyMatrix([[0, 1, 4]], 2, { undirected: true })
      assert.strictEqual(result[0][1], 4)
      assert.strictEqual(result[1][0], 4)
    })

    it('should treat directed as default when undirected is false', function () {
      const result = math.adjacencyMatrix([[0, 1]], 2, { undirected: false })
      assert.strictEqual(result[0][1], 1)
      assert.strictEqual(result[1][0], 0)
    })
  })

  describe('edge cases', function () {
    it('should handle self-loops', function () {
      const result = math.adjacencyMatrix([[0, 0]], 2)
      assert.strictEqual(result[0][0], 1)
    })

    it('should use n even when edges imply a smaller matrix', function () {
      const result = math.adjacencyMatrix([[0, 1]], 4)
      assert.strictEqual(result.length, 4)
      assert.strictEqual(result[0].length, 4)
    })
  })
})
