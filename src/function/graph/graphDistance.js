import { factory } from '../../utils/factory.js'

const name = 'graphDistance'
const dependencies = ['typed']

export const createGraphDistance = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Find the shortest path distance between two nodes in a weighted graph.
   *
   * Uses Dijkstra's algorithm. Returns just the numeric distance, unlike
   * shortestPath which also returns the full path array.
   *
   * Syntax:
   *
   *     math.graphDistance(graph, start, end)
   *
   * Examples:
   *
   *     math.graphDistance({0: [[1,3],[2,1]], 1: [[2,1]], 2: []}, 0, 2)   // returns 1
   *     math.graphDistance({A: [["B",2],["C",5]], B: [["C",1]], C: []}, "A", "C")  // returns 3
   *     math.graphDistance({0: [[1,1]], 1: [], 2: []}, 0, 2)              // returns Infinity
   *
   * See also:
   *
   *     shortestPath, minimumSpanningTree, isConnected
   *
   * @param {Object} graph         Weighted adjacency list: { node: [[neighbor, weight], ...], ... }
   * @param {string|number} start  Start node
   * @param {string|number} end    End node
   * @return {number}              Shortest distance, or Infinity if unreachable
   */
  return typed(name, {
    'Object, number, number': function (graph, start, end) {
      return _dijkstraDistance(graph, start, end)
    },

    'Object, string, string': function (graph, start, end) {
      return _dijkstraDistance(graph, start, end)
    }
  })

  function _dijkstraDistance (graph, start, end) {
    const dist = {}
    const visited = {}

    const nodes = Object.keys(graph)
    for (let i = 0; i < nodes.length; i++) {
      dist[nodes[i]] = Infinity
    }
    dist[start] = 0

    const heap = [[0, start]]

    while (heap.length > 0) {
      const current = _heapPop(heap)
      const currentDist = current[0]
      const u = current[1]

      if (visited[u]) continue
      visited[u] = true

      if (u === end) return currentDist

      const neighbors = graph[u]
      if (!neighbors) continue

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i]
        const v = neighbor[0]
        const weight = neighbor[1]
        const alt = currentDist + weight

        if (dist[v] === undefined) {
          dist[v] = Infinity
        }

        if (alt < dist[v]) {
          dist[v] = alt
          _heapPush(heap, [alt, v])
        }
      }
    }

    return dist[end] !== undefined ? dist[end] : Infinity
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
})
