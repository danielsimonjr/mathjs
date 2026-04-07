export const loessDocs = {
  name: 'loess',
  category: 'Numeric',
  syntax: [
    'loess(x, y)',
    'loess(x, y, span)'
  ],
  description: 'Compute locally weighted scatterplot smoothing (LOESS/LOWESS). For each point x_i, fits a weighted linear regression using neighboring data points with a tricube weight function. The span parameter controls what fraction of the data is used for each local fit.',
  examples: [
    'loess([1, 2, 3, 4, 5], [1, 4, 9, 16, 25])',
    'loess([1, 2, 3, 4, 5], [1, 4, 9, 16, 25], 0.6)',
    'loess([1, 2, 3, 4, 5], [2, 4, 5, 4, 2], 0.8)'
  ],
  seealso: ['polyfit', 'curvefit', 'interpolate']
}
