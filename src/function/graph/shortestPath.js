import { factory } from '../../utils/factory.js'

const name = 'shortestPath'
const dependencies = ['typed']

export const createShortestPath = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find the shortest path between two nodes in a weighted graph using
     * Dijkstra's algorithm.
     *
     * Syntax:
     *
     *     math.shortestPath(graph, start, end)
     *
     * Examples:
     *
     *     const g = {A: [["B",1],["C",4]], B: [["A",1],["D",1]], C: [["A",4],["D",3]], D: [["B",1],["C",3]]}
     *     math.shortestPath(g, "A", "D")
     *     // {distance: 2, path: ["A","B","D"]}
     *
     *     math.shortestPath({0:[[1,2],[2,9]], 1:[[2,3]], 2:[]}, 0, 2)
     *     // {distance: 5, path: [0,1,2]}
     *
     * See also:
     *
     *     adjacencyMatrix, minimumSpanningTree
     *
     * @param {Object} graph  Weighted adjacency list: { node: [[neighbor, weight], ...], ... }
     * @param {string|number} start  Start node
     * @param {string|number} end    End node
     * @return {Object}  Object with `distance` (number) and `path` (Array of nodes)
     */
    return typed(name, {
      'Object, number, number': function (graph, start, end) {
        return _dijkstra(graph, start, end)
      },

      'Object, string, string': function (graph, start, end) {
        return _dijkstra(graph, start, end)
      }
    })

    function _dijkstra (graph, start, end) {
      const dist = {}
      const prev = {}
      const visited = {}

      // Initialize distances to Infinity for all known nodes
      const nodes = Object.keys(graph)
      for (let i = 0; i < nodes.length; i++) {
        dist[nodes[i]] = Infinity
        prev[nodes[i]] = null
      }
      dist[start] = 0

      // Binary min-heap priority queue — O((V+E) log V)
      const heap = [[0, start]]

      while (heap.length > 0) {
        const current = _heapPop(heap)
        const currentDist = current[0]
        const u = current[1]

        if (visited[u]) continue
        visited[u] = true

        if (u === end) break

        const neighbors = graph[u]
        if (!neighbors) continue

        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = neighbors[i]
          const v = neighbor[0]
          const weight = neighbor[1]
          const alt = currentDist + weight

          if (dist[v] === undefined) {
            dist[v] = Infinity
            prev[v] = null
          }

          if (alt < dist[v]) {
            dist[v] = alt
            prev[v] = u
            _heapPush(heap, [alt, v])
          }
        }
      }

      // Reconstruct path
      if (dist[end] === undefined || dist[end] === Infinity) {
        return { distance: Infinity, path: [] }
      }

      const path = []
      let current = end
      while (current !== null) {
        path.unshift(current)
        current = prev[current]
      }

      // Verify path starts at start (i.e., end is reachable)
      if (path[0] !== start) {
        return { distance: Infinity, path: [] }
      }

      return { distance: dist[end], path }
    }

    function _heapPush (heap, item) {
      heap.push(item)
      let i = heap.length - 1
      while (i > 0) {
        const parent = (i - 1) >> 1
        if (heap[parent][0] <= heap[i][0]) break
        const tmp = heap[parent]
        heap[parent] = heap[i]
        heap[i] = tmp
        i = parent
      }
    }

    function _heapPop (heap) {
      const top = heap[0]
      const last = heap.pop()
      if (heap.length > 0) {
        heap[0] = last
        let i = 0
        while (true) {
          let smallest = i
          const left = 2 * i + 1
          const right = 2 * i + 2
          if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left
          if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right
          if (smallest === i) break
          const tmp = heap[smallest]
          heap[smallest] = heap[i]
          heap[i] = tmp
          i = smallest
        }
      }
      return top
    }
  }
)
