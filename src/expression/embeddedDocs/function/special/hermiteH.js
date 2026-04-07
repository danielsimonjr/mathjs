export const hermiteHDocs = {
  name: 'hermiteH',
  category: 'Special',
  syntax: ['hermiteH(n, x)'],
  description: "Evaluate the physicist's Hermite polynomial H_n(x) using the recurrence: H_0=1, H_1=2x, H_{n+1}=2*x*H_n - 2*n*H_{n-1}. n must be a non-negative integer.",
  examples: [
    'hermiteH(0, 1)',
    'hermiteH(1, 1)',
    'hermiteH(2, 1)',
    'hermiteH(3, 1)'
  ],
  seealso: ['chebyshevT', 'laguerreL', 'legendreP']
}
