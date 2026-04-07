import { factory } from '../../utils/factory.js'

const name = 'adjacencyMatrix'
const dependencies = ['typed']

export const createAdjacencyMatrix = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Convert an edge list to an adjacency matrix.
     *
     * Syntax:
     *
     *     math.adjacencyMatrix(edges)
     *     math.adjacencyMatrix(edges, n)
     *     math.adjacencyMatrix(edges, n, options)
     *
     * Examples:
     *
     *     math.adjacencyMatrix([[0,1],[1,2],[2,0]])
     *     // [[0,1,0],[0,0,1],[1,0,0]]
     *
     *     math.adjacencyMatrix([[0,1,5],[1,2,3]], 3)
     *     // [[0,5,0],[0,0,3],[0,0,0]]
     *
     *     math.adjacencyMatrix([[0,1],[1,0]], 2, {undirected: true})
     *     // [[0,1],[1,0]]
     *
     * See also:
     *
     *     shortestPath, minimumSpanningTree
     *
     * @param {Array} edges   Array of edges: [[from, to], ...] or [[from, to, weight], ...]
     * @param {number} [n]    Number of nodes. Auto-detected from max node index if omitted.
     * @param {Object} [options]  Options object. Supports `undirected` (boolean, default false).
     * @return {Array}  2D array (n x n adjacency matrix)
     */
    return typed(name, {
      Array: function (edges) {
        return _adjacencyMatrix(edges, null, {})
      },

      'Array, number': function (edges, n) {
        return _adjacencyMatrix(edges, n, {})
      },

      'Array, number, Object': function (edges, n, options) {
        return _adjacencyMatrix(edges, n, options)
      },

      'Array, Object': function (edges, options) {
        return _adjacencyMatrix(edges, null, options)
      }
    })

    function _adjacencyMatrix (edges, n, options) {
      const undirected = options && options.undirected === true

      // Auto-detect n from max node index if not provided
      let size = n
      if (size == null) {
        let maxNode = -1
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i]
          if (edge[0] > maxNode) maxNode = edge[0]
          if (edge[1] > maxNode) maxNode = edge[1]
        }
        size = maxNode + 1
      }

      // Initialize n x n matrix with zeros
      const matrix = []
      for (let i = 0; i < size; i++) {
        matrix[i] = []
        for (let j = 0; j < size; j++) {
          matrix[i][j] = 0
        }
      }

      // Fill matrix from edge list
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i]
        const from = edge[0]
        const to = edge[1]
        const weight = edge.length >= 3 ? edge[2] : 1

        if (from < 0 || from >= size || to < 0 || to >= size) {
          throw new Error(
            'adjacencyMatrix: node index ' + (from < 0 || from >= size ? from : to) +
            ' is out of bounds [0, ' + size + ')'
          )
        }

        matrix[from][to] = weight
        if (undirected) {
          matrix[to][from] = weight
        }
      }

      return matrix
    }
  }
)
