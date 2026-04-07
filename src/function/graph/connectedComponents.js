import { factory } from '../../utils/factory.js'

const name = 'connectedComponents'
const dependencies = ['typed']

export const createConnectedComponents = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find all connected components of an undirected graph using BFS.
     *
     * Syntax:
     *
     *     math.connectedComponents(graph)
     *
     * Examples:
     *
     *     math.connectedComponents({0:[1], 1:[0], 2:[3], 3:[2]})
     *     // [[0,1],[2,3]]
     *
     *     math.connectedComponents({A:["B","C"], B:["A"], C:["A"], D:[]})
     *     // [["A","B","C"],["D"]]
     *
     * See also:
     *
     *     stronglyConnectedComponents, topologicalSort
     *
     * @param {Object} graph  Undirected adjacency list: { node: [neighbors], ... }
     * @return {Array}  Array of components, each component is an array of nodes
     */
    return typed(name, {
      Object: function (graph) {
        return _connectedComponents(graph)
      }
    })

    function _connectedComponents (graph) {
      const visited = {}
      const components = []
      const nodes = Object.keys(graph)

      for (let i = 0; i < nodes.length; i++) {
        const startNode = nodes[i]
        if (visited[startNode]) continue

        // BFS from startNode
        const component = []
        const queue = [startNode]
        visited[startNode] = true

        while (queue.length > 0) {
          const node = queue.shift()
          component.push(node)

          const neighbors = graph[node]
          if (!neighbors) continue

          for (let j = 0; j < neighbors.length; j++) {
            const neighbor = neighbors[j]
            // Normalize to string for visited lookup
            const neighborKey = String(neighbor)
            if (!visited[neighborKey]) {
              visited[neighborKey] = true
              queue.push(neighbor)
            }
          }
        }

        components.push(component)
      }

      return components
    }
  }
)
