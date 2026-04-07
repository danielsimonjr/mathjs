export const laguerreLDocs = {
  name: 'laguerreL',
  category: 'Special',
  syntax: ['laguerreL(n, x)'],
  description: 'Evaluate the Laguerre polynomial L_n(x) using the recurrence: L_0=1, L_1=1-x, (n+1)*L_{n+1}=(2n+1-x)*L_n - n*L_{n-1}. n must be a non-negative integer.',
  examples: [
    'laguerreL(0, 1)',
    'laguerreL(1, 1)',
    'laguerreL(2, 1)',
    'laguerreL(3, 1)'
  ],
  seealso: ['chebyshevT', 'hermiteH', 'legendreP']
}
