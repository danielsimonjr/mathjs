import { factory } from '../../utils/factory.js'

const name = 'minimumSpanningTree'
const dependencies = ['typed']

export const createMinimumSpanningTree = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find the minimum spanning tree of a weighted undirected graph using
     * Kruskal's algorithm with union-find.
     *
     * Syntax:
     *
     *     math.minimumSpanningTree(edges, n)
     *
     * Examples:
     *
     *     math.minimumSpanningTree([[0,1,1],[1,2,2],[0,2,3]], 3)
     *     // [[0,1,1],[1,2,2]]
     *
     *     math.minimumSpanningTree([[0,1,4],[0,2,3],[1,2,1],[1,3,2],[2,3,4]], 4)
     *     // [[1,2,1],[1,3,2],[0,2,3]]
     *
     * See also:
     *
     *     shortestPath, adjacencyMatrix
     *
     * @param {Array}  edges  Edge list: [[from, to, weight], ...]
     * @param {number} n      Number of nodes
     * @return {Array}  Array of edges [[from, to, weight], ...] forming the MST
     */
    return typed(name, {
      'Array, number': function (edges, n) {
        return _kruskal(edges, n)
      }
    })

    function _kruskal (edges, n) {
      // Sort edges by weight ascending
      const sorted = edges.slice().sort(function (a, b) { return a[2] - b[2] })

      // Union-Find data structure
      const parent = []
      const rank = []
      for (let i = 0; i < n; i++) {
        parent[i] = i
        rank[i] = 0
      }

      function find (x) {
        if (parent[x] !== x) {
          parent[x] = find(parent[x]) // path compression
        }
        return parent[x]
      }

      function union (x, y) {
        const rootX = find(x)
        const rootY = find(y)
        if (rootX === rootY) return false // cycle

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX
        } else {
          parent[rootY] = rootX
          rank[rootX]++
        }
        return true
      }

      const mst = []
      for (let i = 0; i < sorted.length; i++) {
        const edge = sorted[i]
        const from = edge[0]
        const to = edge[1]
        const weight = edge[2]

        if (union(from, to)) {
          mst.push([from, to, weight])
        }

        // MST has at most n-1 edges
        if (mst.length === n - 1) break
      }

      return mst
    }
  }
)
