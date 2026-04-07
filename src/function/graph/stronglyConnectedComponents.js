import { factory } from '../../utils/factory.js'

const name = 'stronglyConnectedComponents'
const dependencies = ['typed']

export const createStronglyConnectedComponents = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find all strongly connected components (SCCs) of a directed graph using
     * Tarjan's algorithm.
     *
     * Syntax:
     *
     *     math.stronglyConnectedComponents(graph)
     *
     * Examples:
     *
     *     math.stronglyConnectedComponents({0:[1], 1:[2], 2:[0], 3:[4], 4:[]})
     *     // [[2,1,0],[4],[3]]
     *
     *     math.stronglyConnectedComponents({A:["B"], B:["C"], C:["A"], D:["E"], E:[]})
     *     // [["C","B","A"],["E"],["D"]]
     *
     * See also:
     *
     *     connectedComponents, topologicalSort
     *
     * @param {Object} graph  Directed adjacency list: { node: [neighbors], ... }
     * @return {Array}  Array of SCCs, each SCC is an array of nodes
     */
    return typed(name, {
      Object: function (graph) {
        return _tarjan(graph)
      }
    })

    function _tarjan (graph) {
      const nodes = Object.keys(graph)
      const index = {}
      const lowlink = {}
      const onStack = {}
      const stack = []
      const sccs = []
      let counter = 0

      function strongconnect (v) {
        index[v] = counter
        lowlink[v] = counter
        counter++
        stack.push(v)
        onStack[v] = true

        const neighbors = graph[v]
        if (neighbors) {
          for (let i = 0; i < neighbors.length; i++) {
            const w = String(neighbors[i])

            if (index[w] === undefined) {
              // Successor w has not yet been visited; recurse on it
              strongconnect(w)
              if (lowlink[w] < lowlink[v]) {
                lowlink[v] = lowlink[w]
              }
            } else if (onStack[w]) {
              // Successor w is on stack and hence in the current SCC
              if (index[w] < lowlink[v]) {
                lowlink[v] = index[w]
              }
            }
          }
        }

        // If v is a root node, pop the stack to get an SCC
        if (lowlink[v] === index[v]) {
          const scc = []
          let w
          do {
            w = stack.pop()
            onStack[w] = false
            scc.push(w)
          } while (w !== v)
          sccs.push(scc)
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        if (index[nodes[i]] === undefined) {
          strongconnect(nodes[i])
        }
      }

      return sccs
    }
  }
)
