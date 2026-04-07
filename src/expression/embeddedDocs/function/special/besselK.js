export const besselKDocs = {
  name: 'besselK',
  category: 'Special',
  syntax: ['besselK(n, x)'],
  description: 'Compute the modified Bessel function of the second kind K_n(x). Only valid for x > 0. Returns Infinity for x = 0.',
  examples: ['besselK(0, 1)', 'besselK(1, 1)', 'besselK(2, 2)'],
  seealso: ['besselJ', 'besselY', 'besselI', 'gamma']
}
