export const lucasLDocs = {
  name: 'lucasL',
  category: 'Combinatorics',
  syntax: [
    'lucasL(n)'
  ],
  description:
    'Compute the nth Lucas number. ' +
    'L(0) = 2, L(1) = 1, L(n) = L(n-1) + L(n-2).',
  examples: [
    'lucasL(0)',
    'lucasL(1)',
    'lucasL(5)',
    'lucasL(10)'
  ],
  seealso: ['fibonacci', 'bellNumbers', 'catalan']
}
