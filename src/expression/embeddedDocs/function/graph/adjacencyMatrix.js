export const adjacencyMatrixDocs = {
  name: 'adjacencyMatrix',
  category: 'Graph',
  syntax: [
    'adjacencyMatrix(edges)',
    'adjacencyMatrix(edges, n)',
    'adjacencyMatrix(edges, n, options)'
  ],
  description:
    'Convert an edge list to an adjacency matrix. ' +
    'Edges are arrays [from, to] (unweighted) or [from, to, weight] (weighted). ' +
    'n is the number of nodes (auto-detected if omitted). ' +
    'Options: {undirected: true} to fill both directions.',
  examples: [
    'adjacencyMatrix([[0,1],[1,2],[2,0]])',
    'adjacencyMatrix([[0,1,5],[1,2,3]], 3)',
    'adjacencyMatrix([[0,1],[1,2]], 3, {undirected: true})'
  ],
  seealso: ['shortestPath', 'minimumSpanningTree']
}
