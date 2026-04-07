export const stronglyConnectedComponentsDocs = {
  name: 'stronglyConnectedComponents',
  category: 'Graph',
  syntax: [
    'stronglyConnectedComponents(graph)'
  ],
  description:
    "Find all strongly connected components (SCCs) of a directed graph using Tarjan's algorithm. " +
    'The graph is a directed adjacency list: {node: [neighbors, ...]}. ' +
    'Returns an array of arrays, where each inner array contains the nodes of one SCC. ' +
    'Nodes that can reach each other via directed paths form one SCC.',
  examples: [],
  seealso: ['connectedComponents', 'topologicalSort']
}
