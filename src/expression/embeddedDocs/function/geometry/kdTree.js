export const kdTreeDocs = {
  name: 'kdTree',
  category: 'Geometry',
  syntax: [
    'kdTree(points)'
  ],
  description: 'Builds a balanced k-d tree from an array of points for efficient nearest-neighbor and range queries. Returns an object with nearest(point, k) and rangeSearch(point, radius) methods.',
  examples: [
    'kdTree([[0,0],[1,0],[0,1],[1,1],[0.5,0.5]])'
  ],
  seealso: ['distance', 'manhattanDistance', 'chebyshevDistance']
}
