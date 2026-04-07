export const covarianceDocs = {
  name: 'covariance',
  category: 'Statistics',
  syntax: ['covariance(x, y)'],
  description:
    'Compute the sample covariance of two datasets. cov(x, y) = sum((x_i - mean_x) * (y_i - mean_y)) / (n - 1)',
  examples: [
    'covariance([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])',
    'covariance([1, 2, 3], [3, 2, 1])'
  ],
  seealso: ['mean', 'std', 'variance', 'linreg']
}
