export const linregDocs = {
  name: 'linreg',
  category: 'Statistics',
  syntax: ['linreg(x, y)'],
  description:
    'Perform simple linear regression (ordinary least squares) on two datasets. Returns an object with slope, intercept, r (correlation coefficient), r2 (R-squared), and predict(x) function.',
  examples: [
    'r = linreg([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])',
    'r.slope',
    'r.intercept',
    'r.r2',
    'r.predict(6)'
  ],
  seealso: ['covariance', 'mean', 'std']
}
