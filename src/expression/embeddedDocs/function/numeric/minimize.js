export const minimizeDocs = {
  name: 'minimize',
  category: 'Numeric',
  syntax: [
    'minimize(f, x0)',
    'minimize(f, x0, options)'
  ],
  description: 'Find a local minimum of a function using the Nelder-Mead simplex method. Works for any dimension without requiring derivatives. Returns an object with x, fval, iterations, and converged.',
  examples: [
    'f(v) = (v[1] - 1)^2 + (v[2] - 2)^2',
    'minimize(f, [0, 0])',
    'minimize(f, [0, 0], {tol: 1e-10, maxIter: 2000})'
  ],
  seealso: ['maximize', 'globalMinimize', 'leastSquares']
}
