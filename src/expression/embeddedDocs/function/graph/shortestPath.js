export const shortestPathDocs = {
  name: 'shortestPath',
  category: 'Graph',
  syntax: [
    'shortestPath(graph, start, end)'
  ],
  description:
    'Find the shortest path between two nodes in a weighted directed graph ' +
    'using Dijkstra\'s algorithm. ' +
    'The graph is a weighted adjacency list: {node: [[neighbor, weight], ...]}. ' +
    'Returns an object {distance, path}. ' +
    'If no path exists, returns {distance: Infinity, path: []}.',
  examples: [],
  seealso: ['adjacencyMatrix', 'minimumSpanningTree']
}
