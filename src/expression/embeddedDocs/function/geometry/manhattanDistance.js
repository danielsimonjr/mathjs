export const manhattanDistanceDocs = {
  name: 'manhattanDistance',
  category: 'Geometry',
  syntax: [
    'manhattanDistance(a, b)'
  ],
  description: 'Calculates the Manhattan distance (L1 distance) between two points in N-dimensional space. The result is the sum of the absolute differences of their coordinates.',
  examples: [
    'manhattanDistance([0, 0], [3, 4])',
    'manhattanDistance([1, 2, 3], [4, 6, 8])'
  ],
  seealso: ['distance', 'chebyshevDistance', 'minkowskiDistance']
}
