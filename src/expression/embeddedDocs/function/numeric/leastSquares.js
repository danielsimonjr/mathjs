export const leastSquaresDocs = {
  name: 'leastSquares',
  category: 'Numeric',
  syntax: [
    'leastSquares(f, x0, data)',
    'leastSquares(f, x0, data, options)'
  ],
  description: 'Solve a nonlinear least squares problem using the Gauss-Newton method with backtracking line search and Levenberg-Marquardt regularization. Minimizes the sum of squared residuals returned by f(params, data). Returns an object with x, resnorm, iterations, and converged.',
  examples: [],
  seealso: ['minimize', 'curvefit', 'polyfit']
}
