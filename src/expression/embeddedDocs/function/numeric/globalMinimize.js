export const globalMinimizeDocs = {
  name: 'globalMinimize',
  category: 'Numeric',
  syntax: [
    'globalMinimize(f, bounds)',
    'globalMinimize(f, bounds, options)'
  ],
  description: 'Find the global minimum of a function using the differential evolution algorithm, a population-based stochastic method that does not require derivatives. bounds is an array of [lo, hi] pairs for each dimension. Returns an object with x, fval, and iterations.',
  examples: [
    'f(v) = (v[1] - 3)^2 + (v[2] + 1)^2',
    'globalMinimize(f, [[-10, 10], [-10, 10]])',
    'globalMinimize(f, [[-10, 10], [-10, 10]], {populationSize: 30, maxIter: 500})'
  ],
  seealso: ['minimize', 'maximize']
}
