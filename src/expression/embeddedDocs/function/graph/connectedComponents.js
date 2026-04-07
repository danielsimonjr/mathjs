export const connectedComponentsDocs = {
  name: 'connectedComponents',
  category: 'Graph',
  syntax: [
    'connectedComponents(graph)'
  ],
  description:
    'Find all connected components of an undirected graph using BFS. ' +
    'The graph is an adjacency list: {node: [neighbors, ...]}. ' +
    'Returns an array of arrays, where each inner array contains the ' +
    'nodes of one connected component.',
  examples: [],
  seealso: ['stronglyConnectedComponents', 'topologicalSort']
}
