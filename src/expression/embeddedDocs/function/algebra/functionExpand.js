export const functionExpandDocs = {
  name: 'functionExpand',
  category: 'Algebra',
  syntax: ['functionExpand(expr)'],
  description:
    'Expand special function identities: gamma recurrence gamma(n+1)->n*gamma(n), beta(a,b)->gamma(a)*gamma(b)/gamma(a+b), binomial coefficients, and evaluates gamma/factorial at integer arguments.',
  examples: [
    'functionExpand("gamma(n + 1)")',
    'functionExpand("beta(a, b)")',
    'functionExpand("combinations(n, k)")',
    'functionExpand("gamma(5)")'
  ],
  seealso: ['simplify']
}
