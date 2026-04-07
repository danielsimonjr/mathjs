export const histogramDocs = {
  name: 'histogram',
  category: 'Statistics',
  syntax: [
    'histogram(data, bins)',
    'histogram(data, binEdges)'
  ],
  description:
    'Compute a frequency histogram. If bins is a number, creates that many equal-width bins from min to max. If bins is an array, uses those values as bin edges. Returns an object with counts, binEdges, and binCenters.',
  examples: [
    'histogram([1, 2, 2, 3, 3, 3], 3)',
    'histogram([1, 2, 2, 3, 3, 3], [1, 2, 3, 4])'
  ],
  seealso: ['mean', 'std', 'variance']
}
