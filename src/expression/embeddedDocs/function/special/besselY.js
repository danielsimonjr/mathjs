export const besselYDocs = {
  name: 'besselY',
  category: 'Special',
  syntax: ['besselY(n, x)'],
  description: 'Compute the Bessel function of the second kind Y_n(x). Only valid for x > 0. Returns -Infinity for x = 0.',
  examples: ['besselY(0, 1)', 'besselY(1, 2.5)', 'besselY(0, 0)'],
  seealso: ['besselJ', 'besselI', 'besselK', 'gamma']
}
