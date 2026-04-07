export const harmonicNumberDocs = {
  name: 'harmonicNumber',
  category: 'Combinatorics',
  syntax: ['harmonicNumber(n)'],
  description: 'Compute the n-th harmonic number H_n = 1 + 1/2 + 1/3 + ... + 1/n. Uses direct summation for small n and asymptotic expansion for large n. n must be a positive integer.',
  examples: ['harmonicNumber(1)', 'harmonicNumber(5)', 'harmonicNumber(10)', 'harmonicNumber(100)'],
  seealso: ['combinations', 'factorial']
}
