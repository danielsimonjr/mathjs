export const maximizeDocs = {
  name: 'maximize',
  category: 'Numeric',
  syntax: [
    'maximize(f, x0)',
    'maximize(f, x0, options)'
  ],
  description: 'Find a local maximum of a function by negating it and applying the Nelder-Mead simplex minimization. Works for any dimension without requiring derivatives. Returns an object with x, fval, iterations, and converged.',
  examples: [
    'g(v) = -(v[1] - 3)^2 - (v[2] + 1)^2 + 10',
    'maximize(g, [0, 0])',
    'maximize(g, [0, 0], {tol: 1e-10})'
  ],
  seealso: ['minimize', 'globalMinimize']
}
