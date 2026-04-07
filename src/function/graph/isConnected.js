import { factory } from '../../utils/factory.js'

const name = 'isConnected'
const dependencies = ['typed']

export const createIsConnected = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Check whether an undirected graph is connected.
   *
   * A graph is connected if there is a path between every pair of nodes.
   * Uses BFS from the first node and checks if all nodes are reachable.
   *
   * Syntax:
   *
   *     math.isConnected(graph)
   *
   * Examples:
   *
   *     math.isConnected({0: [1], 1: [0]})          // returns true
   *     math.isConnected({0: [], 1: []})             // returns false
   *     math.isConnected({A: ["B"], B: ["A"]})       // returns true
   *     math.isConnected({})                         // returns true  (empty graph)
   *
   * See also:
   *
   *     connectedComponents, stronglyConnectedComponents
   *
   * @param {Object} graph  Undirected adjacency list: { node: [neighbors], ... }
   * @return {boolean}      True if the graph is connected, false otherwise
   */
  return typed(name, {
    Object: function (graph) {
      return _isConnected(graph)
    }
  })

  function _isConnected (graph) {
    const nodes = Object.keys(graph)
    if (nodes.length === 0) return true
    if (nodes.length === 1) return true

    const visited = {}
    const queue = [nodes[0]]
    visited[nodes[0]] = true

    while (queue.length > 0) {
      const node = queue.shift()
      const neighbors = graph[node]
      if (!neighbors) continue

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = String(neighbors[i])
        if (!visited[neighbor]) {
          visited[neighbor] = true
          queue.push(neighbors[i])
        }
      }
    }

    // Check all nodes were visited
    for (let i = 0; i < nodes.length; i++) {
      if (!visited[nodes[i]]) return false
    }
    return true
  }
})
