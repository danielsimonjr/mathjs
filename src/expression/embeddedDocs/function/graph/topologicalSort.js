export const topologicalSortDocs = {
  name: 'topologicalSort',
  category: 'Graph',
  syntax: [
    'topologicalSort(graph)'
  ],
  description:
    'Perform a topological sort on a directed acyclic graph (DAG) using ' +
    "Kahn's algorithm. " +
    'The graph is a directed adjacency list: {node: [neighbors, ...]}. ' +
    'Returns nodes in topological order. ' +
    'Throws an error if the graph contains a cycle.',
  examples: [],
  seealso: ['stronglyConnectedComponents', 'connectedComponents']
}
