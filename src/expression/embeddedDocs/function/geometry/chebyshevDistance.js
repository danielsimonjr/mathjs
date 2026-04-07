export const chebyshevDistanceDocs = {
  name: 'chebyshevDistance',
  category: 'Geometry',
  syntax: [
    'chebyshevDistance(a, b)'
  ],
  description: 'Calculates the Chebyshev distance (L-infinity distance) between two points in N-dimensional space. The result is the maximum of the absolute differences of their coordinates.',
  examples: [
    'chebyshevDistance([0, 0], [3, 4])',
    'chebyshevDistance([1, 2, 3], [4, 6, 5])'
  ],
  seealso: ['distance', 'manhattanDistance', 'minkowskiDistance']
}
