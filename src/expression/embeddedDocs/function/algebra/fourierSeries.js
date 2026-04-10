export const fourierSeriesDocs = {
  name: 'fourierSeries',
  category: 'Algebra',
  syntax: [
    'fourierSeries(expr, variable, period)',
    'fourierSeries(expr, variable, period, nTerms)'
  ],
  description: 'Compute the Fourier series coefficients of a periodic function using numeric integration (Simpson\'s rule). Returns { a0, an, bn } where a0 = (1/T)*integral(f), an = (2/T)*integral(f*cos(2*pi*n*x/T)), bn = (2/T)*integral(f*sin(2*pi*n*x/T)).',
  examples: [
    'fourierSeries("x", "x", 2 * pi, 3)',
    'fourierSeries("x^2", "x", 2 * pi, 2)',
    'fourierSeries("abs(x)", "x", 2 * pi, 3)'
  ],
  seealso: [
    'evaluate', 'integrate'
  ]
}
