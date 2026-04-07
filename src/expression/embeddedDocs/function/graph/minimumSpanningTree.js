export const minimumSpanningTreeDocs = {
  name: 'minimumSpanningTree',
  category: 'Graph',
  syntax: [
    'minimumSpanningTree(edges, n)'
  ],
  description:
    'Find the minimum spanning tree of a weighted undirected graph using ' +
    "Kruskal's algorithm with union-find. " +
    'Edges is an array of [from, to, weight] triples. ' +
    'n is the number of nodes. ' +
    'Returns an array of edges [[from, to, weight], ...] forming the MST.',
  examples: [
    'minimumSpanningTree([[0,1,1],[1,2,2],[0,2,3]], 3)',
    'minimumSpanningTree([[0,1,4],[0,2,3],[1,2,1],[1,3,2],[2,3,4]], 4)'
  ],
  seealso: ['shortestPath', 'adjacencyMatrix']
}
