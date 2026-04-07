export const graphDistanceDocs = {
  name: 'graphDistance',
  category: 'Graph',
  syntax: [
    'graphDistance(graph, start, end)'
  ],
  description:
    'Find the shortest path distance between two nodes in a weighted directed graph. ' +
    'Uses Dijkstra\'s algorithm. Returns the numeric distance only (not the path). ' +
    'Returns Infinity if no path exists.',
  examples: [],
  seealso: ['shortestPath', 'minimumSpanningTree', 'isConnected']
}
