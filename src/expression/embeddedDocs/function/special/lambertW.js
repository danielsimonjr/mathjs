export const lambertWDocs = {
  name: 'lambertW',
  category: 'Special',
  syntax: [
    'lambertW(x)'
  ],
  description: 'Compute the Lambert W function W(x), the principal branch W_0. W(x) satisfies W(x)*exp(W(x)) = x. Defined for x >= -1/e.',
  examples: [
    'lambertW(0)',
    'lambertW(1)',
    'lambertW(exp(1))'
  ],
  seealso: ['exp', 'log']
}
