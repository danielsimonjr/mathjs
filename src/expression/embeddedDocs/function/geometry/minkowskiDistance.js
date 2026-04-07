export const minkowskiDistanceDocs = {
  name: 'minkowskiDistance',
  category: 'Geometry',
  syntax: [
    'minkowskiDistance(a, b, p)'
  ],
  description: 'Calculates the Minkowski distance (Lp distance) between two points in N-dimensional space. Generalizes Euclidean (p=2), Manhattan (p=1), and Chebyshev (p=Infinity) distances.',
  examples: [
    'minkowskiDistance([0, 0], [3, 4], 2)',
    'minkowskiDistance([0, 0], [3, 4], 1)',
    'minkowskiDistance([0, 0], [3, 4], Infinity)'
  ],
  seealso: ['distance', 'manhattanDistance', 'chebyshevDistance']
}
