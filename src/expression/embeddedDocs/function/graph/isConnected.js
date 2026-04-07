export const isConnectedDocs = {
  name: 'isConnected',
  category: 'Graph',
  syntax: [
    'isConnected(graph)'
  ],
  description:
    'Check whether an undirected graph is connected. ' +
    'A graph is connected if every node is reachable from every other node. ' +
    'Uses BFS from the first node.',
  examples: [],
  seealso: ['connectedComponents', 'stronglyConnectedComponents']
}
