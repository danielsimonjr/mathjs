export const chebyshevTDocs = {
  name: 'chebyshevT',
  category: 'Special',
  syntax: ['chebyshevT(n, x)'],
  description: 'Evaluate the Chebyshev polynomial of the first kind T_n(x) using the three-term recurrence: T_0=1, T_1=x, T_{n+1}=2*x*T_n - T_{n-1}. n must be a non-negative integer.',
  examples: [
    'chebyshevT(0, 0.5)',
    'chebyshevT(1, 0.5)',
    'chebyshevT(2, 0.5)',
    'chebyshevT(3, 0.5)'
  ],
  seealso: ['hermiteH', 'laguerreL', 'legendreP']
}
