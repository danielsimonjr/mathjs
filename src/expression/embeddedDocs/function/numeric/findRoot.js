export const findRootDocs = {
  name: 'findRoot',
  category: 'Numeric',
  syntax: [
    'findRoot(f, x0)',
    'findRoot(f, a, b)',
    'findRoot(f, x0, options)',
    'findRoot(f, a, b, options)'
  ],
  description: "Find a root of function f(x) = 0. With one starting value uses Newton's method; with two values (bracket) uses Brent's method for guaranteed convergence.",
  examples: [
    'h(x) = x^2 - 4',
    'findRoot(h, 1)',
    'findRoot(cos, 1, 2)',
    'k(x) = x^2 - 2',
    'findRoot(k, 1)'
  ],
  seealso: ['nintegrate', 'derivative', 'solveODE']
}
