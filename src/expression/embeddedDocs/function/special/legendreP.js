export const legendrePDocs = {
  name: 'legendreP',
  category: 'Special',
  syntax: [
    'legendreP(n, x)'
  ],
  description: 'Evaluate the Legendre polynomial P_n(x) using Bonnet\'s recurrence relation. n must be a non-negative integer.',
  examples: [
    'legendreP(0, 0.5)',
    'legendreP(1, 0.5)',
    'legendreP(2, 0.5)',
    'legendreP(3, 0.5)'
  ],
  seealso: ['erf']
}
