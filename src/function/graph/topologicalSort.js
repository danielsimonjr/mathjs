import { factory } from '../../utils/factory.js'

const name = 'topologicalSort'
const dependencies = ['typed']

export const createTopologicalSort = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a topological sort on a directed acyclic graph (DAG) using
     * Kahn's algorithm. Throws an error if the graph contains a cycle.
     *
     * Syntax:
     *
     *     math.topologicalSort(graph)
     *
     * Examples:
     *
     *     math.topologicalSort({0:[1,2], 1:[3], 2:[3], 3:[]})
     *     // [0,1,2,3] or [0,2,1,3]
     *
     *     math.topologicalSort({A:["B","C"], B:["D"], C:["D"], D:[]})
     *     // ["A","B","C","D"] or ["A","C","B","D"]
     *
     * See also:
     *
     *     stronglyConnectedComponents, connectedComponents
     *
     * @param {Object} graph  Directed adjacency list: { node: [neighbors], ... }
     * @return {Array}  Nodes in topological order
     * @throws {Error}  If the graph contains a cycle
     */
    return typed(name, {
      Object: function (graph) {
        return _topologicalSort(graph)
      }
    })

    function _topologicalSort (graph) {
      const nodes = Object.keys(graph)
      const inDegree = {}

      // Initialize in-degree to 0 for all nodes
      for (let i = 0; i < nodes.length; i++) {
        inDegree[nodes[i]] = 0
      }

      // Compute in-degrees
      for (let i = 0; i < nodes.length; i++) {
        const neighbors = graph[nodes[i]]
        if (!neighbors) continue
        for (let j = 0; j < neighbors.length; j++) {
          const neighbor = String(neighbors[j])
          if (inDegree[neighbor] === undefined) {
            inDegree[neighbor] = 0
          }
          inDegree[neighbor]++
        }
      }

      // Queue of nodes with in-degree 0
      const queue = []
      for (let i = 0; i < nodes.length; i++) {
        if (inDegree[nodes[i]] === 0) {
          queue.push(nodes[i])
        }
      }

      const result = []

      while (queue.length > 0) {
        const node = queue.shift()
        // Preserve original type (number vs string)
        const originalNode = isNaN(Number(node)) ? node : Number(node)
        result.push(originalNode)

        const neighbors = graph[node]
        if (!neighbors) continue

        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = String(neighbors[i])
          inDegree[neighbor]--
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor)
          }
        }
      }

      if (result.length !== nodes.length) {
        throw new Error('Graph contains a cycle — topological sort is not possible')
      }

      return result
    }
  }
)
